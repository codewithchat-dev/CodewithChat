import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { buildPreviewFiles } from "@/lib/preview-files";

const MAX_DEPLOYMENT_SIZE = 10 * 1024 * 1024;

function getProjectName(projectId: string) {
  return `codewithchat-${projectId.toLowerCase()}`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = process.env.VERCEL_TOKEN;

    if (!token || token === "replace_with_vercel_token") {
      return NextResponse.json(
        { error: "Vercel deployment is not configured yet." },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => null);
    const projectId =
      typeof body?.projectId === "string" ? body.projectId.trim() : "";

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 },
      );
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const project = await db.project.findFirst({
      where: { id: projectId, userId: dbUser.id },
      select: { id: true, code: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    if (!project.code) {
      return NextResponse.json(
        { error: "Generate the project before deploying it." },
        { status: 400 },
      );
    }

    let savedPlan: { previewFiles?: Array<{ path: string; content: string }> };

    try {
      savedPlan = JSON.parse(project.code);
    } catch {
      return NextResponse.json(
        { error: "The saved project files are invalid." },
        { status: 400 },
      );
    }

    const fileMap = buildPreviewFiles(savedPlan.previewFiles);
    const files = Object.entries(fileMap).map(([file, data]) => ({
      file: file.replace(/^\/+/, ""),
      data,
    }));

    if (!files.length || !files.some((file) => file.file === "package.json")) {
      return NextResponse.json(
        { error: "No deployable project files were found." },
        { status: 400 },
      );
    }

    const totalSize = files.reduce(
      (sum, file) => sum + Buffer.byteLength(file.data, "utf8"),
      0,
    );

    if (totalSize > MAX_DEPLOYMENT_SIZE) {
      return NextResponse.json(
        { error: "Project is too large to deploy. Keep it under 10 MB." },
        { status: 413 },
      );
    }

    for (const file of files) {
      if (!file.file || file.file.includes("..") || file.file.startsWith("/")) {
        return NextResponse.json(
          { error: "Invalid project file path." },
          { status: 400 },
        );
      }
    }

  const teamId = process.env.VERCEL_TEAM_ID?.trim();

if (!teamId) {
  return NextResponse.json(
    { error: "VERCEL_TEAM_ID is not configured." },
    { status: 503 },
  );
}

const teamQuery = `?teamId=${encodeURIComponent(teamId)}`;

    const vercelResponse = await fetch(
      `https://api.vercel.com/v13/deployments${teamQuery}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: getProjectName(project.id),
          target: "production",
          files,
          projectSettings: {
            framework: "vite",
            buildCommand: "npm run build",
            installCommand: "npm install",
            outputDirectory: "dist",
          },
        }),
      },
    );

    const result = await vercelResponse.json().catch(() => null);

    if (!vercelResponse.ok || !result?.url) {
      console.error("[Vercel Deploy] API error:", result);

      return NextResponse.json(
        { error: result?.error?.message || "Vercel deployment failed." },
        { status: vercelResponse.status || 502 },
      );
    }

    return NextResponse.json({
      success: true,
      url: `https://${result.url}`,
      deploymentId: result.id,
    });
  } catch (error) {
    console.error("[Vercel Deploy] Unexpected error:", error);

    return NextResponse.json(
      { error: "Unable to start the Vercel deployment." },
      { status: 500 },
    );
  }
}
