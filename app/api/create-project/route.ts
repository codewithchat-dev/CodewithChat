import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { MAX_DAILY_CREDITS } from '@/lib/credits'

/**
 * GET /api/create-project?idea=...
 *
 * Responsibilities:
 * 1. Check authentication
 * 2. Ensure the user exists in our database
 * 3. Create an empty project shell
 * 4. Redirect the user to the project editor
 *
 * IMPORTANT:
 * This route does NOT consume a generation credit.
 * Credits are consumed only when /api/generate-plan actually runs.
 */
export async function GET(req: NextRequest) {
  try {
    // ─────────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────────

    const { userId } = await auth()

    if (!userId) {
      const signInUrl = new URL(
        '/sign-in',
        req.nextUrl.origin,
      )

      return NextResponse.redirect(signInUrl)
    }

    // ─────────────────────────────────────────────
    // PROJECT IDEA
    // ─────────────────────────────────────────────

    const rawIdea =
      req.nextUrl.searchParams
        .get('idea')
        ?.trim()

    // Don't create an empty project accidentally
    if (!rawIdea) {
      return NextResponse.redirect(
        new URL(
          '/dashboard',
          req.nextUrl.origin,
        ),
      )
    }

    // Keep project title readable.
    // Full prompt is still saved in `prompt`.
    const projectTitle =
      rawIdea.length > 70
        ? `${rawIdea.slice(0, 67)}...`
        : rawIdea

    // ─────────────────────────────────────────────
    // USER
    // ─────────────────────────────────────────────

    let dbUser = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    // First time user
    if (!dbUser) {
      const clerkUser =
        await currentUser()

      const email =
        clerkUser
          ?.emailAddresses?.[0]
          ?.emailAddress ??
        `${userId}@placeholder.local`

      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email,

          // New user starts with 5 daily credits
          credits: MAX_DAILY_CREDITS,

          // Used by generate-plan to know
          // when daily credits should reset
          lastCreditResetAt: new Date(),
        },
      })
    }

    // ─────────────────────────────────────────────
    // CREATE PROJECT
    // ─────────────────────────────────────────────

    const project =
      await db.project.create({
        data: {
          userId: dbUser.id,
          title: projectTitle,
          prompt: rawIdea,
        },
      })

    // ─────────────────────────────────────────────
    // CODEWITHCHAT CANONICAL STACK
    // ─────────────────────────────────────────────

    const tech =
      'React + Vite + TypeScript + Tailwind'

    const platform = 'Website'

    // Keep this aligned with /api/generate-plan
    const agent = 'Gemini 2.5 Flash'

    // ─────────────────────────────────────────────
    // REDIRECT TO PROJECT EDITOR
    // ─────────────────────────────────────────────

    const projectUrl = new URL(
      `/dashboard/project/${project.id}`,
      req.nextUrl.origin,
    )

    projectUrl.searchParams.set(
      'tech',
      tech,
    )

    projectUrl.searchParams.set(
      'platform',
      platform,
    )

    projectUrl.searchParams.set(
      'agent',
      agent,
    )

    return NextResponse.redirect(
      projectUrl,
    )
  } catch (error) {
    console.error(
      '[Create Project] Error:',
      error,
    )

    return NextResponse.redirect(
      new URL(
        '/dashboard',
        req.nextUrl.origin,
      ),
    )
  }
}