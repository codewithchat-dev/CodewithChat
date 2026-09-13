import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { db } from "@/lib/db";
import { MAX_DAILY_CREDITS } from "@/lib/credits";
import { projectName } from "@/lib/project-name";

export const runtime = "nodejs";

// Generate the name once and save it with the project.
function createProjectSlug(prompt: string): string {
  // Example: Build “FreshBasket”, a polished frontend...
  const quotedName = prompt.match(
    /(?:build|create|make|design)\s+["“]([^"”\r\n]{1,60})["”]/i,
  )?.[1];

  const baseName = (quotedName || projectName(prompt, ""))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42)
    .replace(/-+$/g, "");

  const suffix = randomBytes(4).toString("hex");

  return `${baseName || "website"}-${suffix}`;
}

/**
 * Creates a project shell and redirects to the editor.
 * Generation credits are consumed by /api/generate-plan.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in", req.nextUrl.origin),
      );
    }

    const rawIdea = req.nextUrl.searchParams.get("idea")?.trim();

    if (!rawIdea) {
      return NextResponse.redirect(
        new URL("/dashboard", req.nextUrl.origin),
      );
    }

    let dbUser = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!dbUser) {
      const clerkUser = await currentUser();

      const email =
        clerkUser?.emailAddresses?.[0]?.emailAddress ??
        `${userId}@placeholder.local`;

      try {
        dbUser = await db.user.create({
          data: {
            clerkId: userId,
            email,
            credits: MAX_DAILY_CREDITS,
            lastCreditResetAt: new Date(),
          },
        });
      } catch (error) {
        // Another request may have created the same user.
        const existingUser = await db.user.findUnique({
          where: {
            clerkId: userId,
          },
        });

        if (!existingUser) {
          throw error;
        }

        dbUser = existingUser;
      }
    }

    const slug = createProjectSlug(rawIdea);

    const project = await db.project.create({
      data: {
        userId: dbUser.id,
        title: slug,
        publishSlug: slug,
        prompt: rawIdea,
      },
    });

    const projectUrl = new URL(
      `/dashboard/project/${project.id}`,
      req.nextUrl.origin,
    );

    projectUrl.searchParams.set(
      "tech",
      "React + Vite + TypeScript + Tailwind",
    );
    projectUrl.searchParams.set("platform", "Website");
    projectUrl.searchParams.set("agent", "Gemini 2.5 Flash");

    return NextResponse.redirect(projectUrl);
  } catch (error) {
    console.error("[Create Project] Error:", error);

    return NextResponse.redirect(
      new URL("/dashboard", req.nextUrl.origin),
    );
  }
}