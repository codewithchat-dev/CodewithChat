import { auth } from "@clerk/nextjs/server";
import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { projectName } from "@/lib/project-name";
import { buildPreviewFiles } from "@/lib/preview-files";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUSY = new Set([
  "QUEUED",
  "INITIALIZING",
  "BUILDING",
  "FINALIZING",
]);

class ApiError extends Error {
  constructor(
    message: string,
    public status = 502,
    public remoteStatus?: number,
  ) {
    super(message);
  }
}

type Deployment = {
  id: string;
  projectId: string;
  readyState: string;
  url?: string;
  errorMessage?: string;
  aliasError?: {
    message?: string;
  } | null;
};

async function vercel<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const token = process.env.VERCEL_TOKEN?.trim();
  const team = process.env.VERCEL_TEAM_ID?.trim();

  if (
    !token ||
    token === "replace_with_vercel_token" ||
    !team
  ) {
    throw new ApiError(
      "Configure VERCEL_TOKEN and VERCEL_TEAM_ID on the server.",
      503,
    );
  }

  const separator = path.includes("?") ? "&" : "?";

  const response = await fetch(
    `https://api.vercel.com${path}${separator}teamId=${encodeURIComponent(team)}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message ||
        `Vercel request failed (${response.status}).`,
      response.status === 429 ? 429 : 502,
      response.status,
    );
  }

  return data as T;
}

async function getOwnedProject(projectId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!/^[a-f0-9]{24}$/i.test(projectId)) {
    throw new ApiError("Invalid project ID.", 400);
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError("User not found.", 404);
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  });

  if (!project) {
    throw new ApiError("Project not found.", 404);
  }

  return project;
}

async function getDeployment(
  deploymentId: string,
  vercelProjectId: string,
) {
  const result = await vercel<Deployment>(
    `/v13/deployments/${encodeURIComponent(deploymentId)}`,
  );

  if (result.projectId !== vercelProjectId) {
    throw new ApiError("Deployment project mismatch.", 403);
  }

  return result;
}

function errorResponse(error: unknown) {
  console.error("[Publish]", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Publishing failed.",
    },
    {
      status: error instanceof ApiError ? error.status : 502,
    },
  );
}

function validateFiles(code: string | null) {
  if (!code) {
    throw new ApiError(
      "Generate and save the project first.",
      400,
    );
  }

  let plan;

  try {
    plan = JSON.parse(code);
  } catch {
    throw new ApiError("Invalid saved project.", 400);
  }

  if (
    !Array.isArray(plan?.previewFiles) ||
    !plan.previewFiles.length
  ) {
    throw new ApiError("No source files to publish.", 400);
  }

  for (const file of plan.previewFiles) {
    if (
      typeof file?.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new ApiError("Invalid source file.", 400);
    }

    const parts = file.path.replace(/\\/g, "/").split("/");

    if (
      parts.includes("..") ||
      /[\0\r\n:]/.test(file.path)
    ) {
      throw new ApiError("Invalid source path.", 400);
    }
  }

  const files = Object.entries(
    buildPreviewFiles(plan.previewFiles),
  ).map(([file, data]) => ({
    file: file.replace(/^\/+/, ""),
    data,
  }));

  const packageFile = files.find(
    (file) => file.file === "package.json",
  );

  if (!packageFile) {
    throw new ApiError("package.json is missing.", 400);
  }

  let manifest;

  try {
    manifest = JSON.parse(packageFile.data);
  } catch {
    throw new ApiError("package.json is invalid JSON.", 400);
  }

  if (
    typeof manifest.scripts?.build !== "string" ||
    !manifest.scripts.build.trim()
  ) {
    throw new ApiError(
      "package.json needs a build script.",
      400,
    );
  }

  if (!files.some((file) => file.file === "index.html")) {
    throw new ApiError("Vite index.html is missing.", 400);
  }

  const size = files.reduce(
    (total, file) =>
      total + Buffer.byteLength(file.data, "utf8"),
    0,
  );

  if (size > 10 * 1024 * 1024) {
    throw new ApiError("Project exceeds 10 MB.", 413);
  }

  return files;
}

// GET /api/vercel/deploy?projectId=...
export async function GET(req: Request) {
  try {
    const projectId =
      new URL(req.url).searchParams.get("projectId") || "";

    const project = await getOwnedProject(projectId);

    if (
      project.publishLockUntil &&
      project.publishLockUntil > new Date()
    ) {
      return NextResponse.json({
        status: "STARTING",
        previousUrl: project.publishedUrl,
      });
    }

    if (project.deploymentStatus === "UNKNOWN") {
      return NextResponse.json({
        status: "UNKNOWN",
        error: project.deploymentError,
        previousUrl: project.publishedUrl,
      });
    }

    if (
      !project.vercelDeploymentId ||
      !project.vercelProjectId
    ) {
      return NextResponse.json({
        status: "IDLE",
        previousUrl: project.publishedUrl,
      });
    }

    const deployment = await getDeployment(
      project.vercelDeploymentId,
      project.vercelProjectId,
    );

    let status = deployment.readyState;
    let url: string | null = null;
    let error = deployment.errorMessage || null;

    if (status === "READY") {
      if (deployment.aliasError) {
        status = "ERROR";
        error =
          deployment.aliasError.message ||
          "Build passed, but domain assignment failed.";
      } else {
        const assigned = await vercel<{
          aliases: Array<{
            alias: string;
            redirect?: string | null;
          }>;
        }>(
          `/v2/deployments/${encodeURIComponent(deployment.id)}/aliases`,
        );

        const expected = `${project.publishSlug}.vercel.app`;

        const alias =
          assigned.aliases.find(
            (item) =>
              item.alias === expected && !item.redirect,
          ) ??
          assigned.aliases.find(
            (item) =>
              !item.redirect &&
              item.alias !== deployment.url &&
              /^[a-z0-9-]+\.vercel\.app$/i.test(item.alias),
          );

        if (alias) {
          url = `https://${alias.alias}`;
        } else {
          status = "FINALIZING";
        }
      }
    }

    // Do not overwrite the status of a newer deployment.
    const updated = await db.project.updateMany({
      where: {
        id: project.id,
        vercelDeploymentId: deployment.id,
      },
      data: {
        deploymentStatus: status,
        deploymentError: error,
        ...(url
          ? {
              publishedUrl: url,
              publishedAt: new Date(),
            }
          : {}),
      },
    });

    if (!updated.count) {
      return NextResponse.json({ status: "STARTING" });
    }

    return NextResponse.json({
      status,
      url,
      error,
      previousUrl: project.publishedUrl,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/vercel/deploy
export async function POST(req: Request) {
  let lock: { id: string; token: string } | null = null;
  let deploymentRequested = false;

  try {
    const body = await req.json().catch(() => null);

    let project = await getOwnedProject(
      typeof body?.projectId === "string"
        ? body.projectId.trim()
        : "",
    );

    const files = validateFiles(project.code);

    if (project.deploymentStatus === "UNKNOWN") {
      throw new ApiError(
        "Previous deployment result is uncertain. Check Vercel before starting another deployment.",
        409,
      );
    }

    const token = randomUUID();

    const acquired = await db.project.updateMany({
      where: {
        id: project.id,
        OR: [
          { publishLockUntil: null },
          { publishLockUntil: { isSet: false } },
          { publishLockUntil: { lt: new Date() } },
        ],
      },
      data: {
        publishLockToken: token,
        publishLockUntil: new Date(Date.now() + 120000),
      },
    });

    if (!acquired.count) {
      return NextResponse.json(
        { status: "STARTING" },
        { status: 202 },
      );
    }

    lock = { id: project.id, token };

    const refreshed = await db.project.findUnique({
      where: { id: project.id },
    });

    if (!refreshed) {
      throw new ApiError("Project not found.", 404);
    }

    project = refreshed;

    if (
      project.vercelDeploymentId &&
      project.vercelProjectId
    ) {
      const existing = await getDeployment(
        project.vercelDeploymentId,
        project.vercelProjectId,
      );

      if (BUSY.has(existing.readyState)) {
        return NextResponse.json(
          { status: existing.readyState },
          { status: 202 },
        );
      }
    }

    let slug = project.publishSlug;
    let vercelProjectId = project.vercelProjectId;

    if (!vercelProjectId) {
      let reservation = await db.publishIdentity.findUnique({
        where: { id: project.id },
      });

      for (
        let attempt = 0;
        attempt < 5 && !reservation;
        attempt++
      ) {
        try {
          reservation = await db.publishIdentity.create({
            data: {
              id: project.id,
              slug: `${projectName(
                project.prompt,
                project.title,
              )}-${randomBytes(4).toString("hex")}`,
            },
          });
        } catch (error) {
          if (
            !(
              typeof error === "object" &&
              error &&
              "code" in error &&
              error.code === "P2002"
            )
          ) {
            throw error;
          }

          reservation = await db.publishIdentity.findUnique({
            where: { id: project.id },
          });
        }
      }

      if (!reservation) {
        throw new ApiError(
          "Could not reserve a unique name. Retry.",
        );
      }

      slug = reservation.slug;

      let created: { id: string } | null = null;

      for (
        let attempt = 0;
        attempt < 3 && !created;
        attempt++
      ) {
        try {
          created = await vercel<{ id: string }>(
            "/v11/projects",
            "POST",
            {
              name: slug,
              framework: "vite",
              ssoProtection: null,
            },
          );
        } catch (error) {
          if (
            !(error instanceof ApiError) ||
            error.remoteStatus !== 409
          ) {
            throw error;
          }

          slug = `${projectName(
            project.prompt,
            project.title,
          )}-${randomBytes(4).toString("hex")}`;

          await db.publishIdentity.update({
            where: { id: project.id },
            data: { slug },
          });
        }
      }

      if (!created) {
        throw new ApiError(
          "Name unavailable. Retry publishing.",
        );
      }

      vercelProjectId = created.id;

      await db.project.update({
        where: { id: project.id },
        data: {
          publishSlug: slug,
          vercelProjectId,
          title: slug,
        },
      });
    }

    if (!slug) {
      throw new ApiError("Missing saved publish slug.");
    }

    // Applies only to this generated website's Vercel project.
    await vercel(
      `/v9/projects/${encodeURIComponent(vercelProjectId)}`,
      "PATCH",
      { ssoProtection: null },
    );

    deploymentRequested = true;

    const result = await vercel<Deployment>(
      "/v13/deployments",
      "POST",
      {
        name: slug,
        project: vercelProjectId,
        target: "production",
        files,
        meta: {
          codewithchatProjectId: project.id,
          publishAttempt: token,
        },
        projectSettings: {
          framework: "vite",
          buildCommand: "npm run build",
          installCommand: "npm install",
          outputDirectory: "dist",
        },
      },
    );

    if (!result.id) {
      throw new ApiError(
        "Vercel did not return a deployment ID.",
      );
    }

    await db.project.update({
      where: { id: project.id },
      data: {
        vercelDeploymentId: result.id,
        deploymentStatus: result.readyState || "QUEUED",
        deploymentError: null,
      },
    });

    return NextResponse.json(
      {
        status:
          result.readyState === "READY"
            ? "FINALIZING"
            : result.readyState || "QUEUED",
      },
      { status: 202 },
    );
  } catch (error) {
    if (
      lock &&
      deploymentRequested &&
      !(error instanceof ApiError && error.remoteStatus)
    ) {
      // A lost response may still represent a running deployment.
      await db.project
        .updateMany({
          where: {
            id: lock.id,
            publishLockToken: lock.token,
          },
          data: {
            deploymentStatus: "UNKNOWN",
            deploymentError:
              "Could not confirm deployment. Check this project's deployment in Vercel before retrying.",
          },
        })
        .catch(console.error);
    }

    return errorResponse(error);
  } finally {
    if (lock) {
      await db.project
        .updateMany({
          where: {
            id: lock.id,
            publishLockToken: lock.token,
          },
          data: {
            publishLockUntil: null,
            publishLockToken: null,
          },
        })
        .catch(console.error);
    }
  }
}