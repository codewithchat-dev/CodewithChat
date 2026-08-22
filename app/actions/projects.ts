'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

import { db } from '@/lib/db'
import { MAX_DAILY_CREDITS } from '@/lib/credits'

// ─────────────────────────────────────────────────────────────
// ERROR HELPER
// ─────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong'
}

// ─────────────────────────────────────────────────────────────
// ENSURE DATABASE USER
// ─────────────────────────────────────────────────────────────

/**
 * Ensures the currently authenticated Clerk user
 * also exists in our MongoDB/Prisma database.
 *
 * Useful for users who signed up before webhooks were
 * enabled or when webhook delivery was delayed.
 */
async function ensureDbUser() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  let dbUser = await db.user.findUnique({
    where: {
      clerkId: userId,
    },
  })

  if (dbUser) {
    return dbUser
  }

  const clerkUser = await currentUser()

  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    `${userId}@placeholder.local`

  const now = new Date()

  /**
   * Another request might create the user at almost
   * the same time.
   *
   * Try create first, then fall back to finding it.
   */
  try {
    dbUser = await db.user.create({
      data: {
        clerkId: userId,
        email,
        credits: MAX_DAILY_CREDITS,
        lastCreditResetAt: now,
      },
    })

    return dbUser
  } catch (error) {
    const existingUser =
      await db.user.findUnique({
        where: {
          clerkId: userId,
        },
      })

    if (existingUser) {
      return existingUser
    }

    throw error
  }
}

// ─────────────────────────────────────────────────────────────
// PROJECT OWNERSHIP
// ─────────────────────────────────────────────────────────────

async function getOwnedProject(
  projectId: string,
  userDbId: string,
) {
  if (!projectId.trim()) {
    throw new Error('Invalid project')
  }

  const project =
    await db.project.findFirst({
      where: {
        id: projectId,
        userId: userDbId,
      },
    })

  if (!project) {
    /**
     * Do not expose whether the project exists but
     * belongs to somebody else.
     */
    throw new Error(
      'Project not found or unauthorized',
    )
  }

  return project
}

// ─────────────────────────────────────────────────────────────
// GET ALL PROJECTS
// ─────────────────────────────────────────────────────────────

export async function getProjects() {
  try {
    const dbUser =
      await ensureDbUser()

    const projects =
      await db.project.findMany({
        where: {
          userId: dbUser.id,
        },

        orderBy: {
          updatedAt: 'desc',
        },
      })

    return {
      success: true as const,
      data: projects,
    }
  } catch (error: unknown) {
    console.error(
      '[Projects] Failed to get projects:',
      error,
    )

    return {
      success: false as const,
      error:
        getErrorMessage(error),
    }
  }
}

// ─────────────────────────────────────────────────────────────
// CREATE PROJECT
// ─────────────────────────────────────────────────────────────

/**
 * Kept for compatibility with components that create
 * projects through a Server Action.
 *
 * Your /api/create-project route can continue to be used
 * for the main builder flow.
 *
 * Creating the project itself does NOT consume a generation
 * credit. /api/generate-plan handles that.
 */
export async function addProjectAction(
  title: string,
  prompt: string,
  code?: string,
) {
  try {
    const cleanTitle =
      title.trim()

    const cleanPrompt =
      prompt.trim()

    if (!cleanPrompt) {
      throw new Error(
        'Project prompt is required',
      )
    }

    const dbUser =
      await ensureDbUser()

    const project =
      await db.project.create({
        data: {
          userId: dbUser.id,

          title:
            cleanTitle ||
            'Untitled Project',

          prompt: cleanPrompt,

          code:
            code?.trim()
              ? code
              : undefined,
        },
      })

    revalidatePath('/dashboard')

    return {
      success: true as const,
      data: project,
    }
  } catch (error: unknown) {
    console.error(
      '[Projects] Failed to add project:',
      error,
    )

    return {
      success: false as const,
      error:
        getErrorMessage(error),
    }
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE GENERATED PROJECT CODE
// ─────────────────────────────────────────────────────────────

/**
 * `code` contains the serialized planSchema object.
 *
 * New architecture:
 *
 * previewFiles = complete real Vite project
 * fullStackFiles = legacy/deprecated
 */
export async function updateProjectAction(
  projectId: string,
  code: string,
) {
  try {
    if (!code.trim()) {
      throw new Error(
        'Project code cannot be empty',
      )
    }

    const dbUser =
      await ensureDbUser()

    await getOwnedProject(
      projectId,
      dbUser.id,
    )

    const updated =
      await db.project.update({
        where: {
          id: projectId,
        },

        data: {
          code,
        },
      })

    /**
     * Dashboard list may display updatedAt.
     */
    revalidatePath('/dashboard')

    /**
     * New-tab preview reads this project directly
     * from the database on the server.
     */
    revalidatePath(
      `/preview/${projectId}`,
    )

    return {
      success: true as const,
      data: updated,
    }
  } catch (error: unknown) {
    console.error(
      '[Projects] Failed to update project:',
      error,
    )

    return {
      success: false as const,
      error:
        getErrorMessage(error),
    }
  }
}

// ─────────────────────────────────────────────────────────────
// GET SINGLE PROJECT
// ─────────────────────────────────────────────────────────────

export async function getProjectByIdAction(
  projectId: string,
) {
  try {
    const dbUser =
      await ensureDbUser()

    const project =
      await getOwnedProject(
        projectId,
        dbUser.id,
      )

    return {
      success: true as const,
      data: project,
    }
  } catch (error: unknown) {
    console.error(
      '[Projects] Failed to get project:',
      error,
    )

    return {
      success: false as const,
      error:
        getErrorMessage(error),
    }
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE PROJECT
// ─────────────────────────────────────────────────────────────

export async function deleteProjectAction(
  projectId: string,
) {
  try {
    const dbUser =
      await ensureDbUser()

    await getOwnedProject(
      projectId,
      dbUser.id,
    )

    await db.project.delete({
      where: {
        id: projectId,
      },
    })

    revalidatePath('/dashboard')

    return {
      success: true as const,
    }
  } catch (error: unknown) {
    console.error(
      '[Projects] Failed to delete project:',
      error,
    )

    return {
      success: false as const,
      error:
        getErrorMessage(error),
    }
  }
}

// ─────────────────────────────────────────────────────────────
// PIN / UNPIN
// ─────────────────────────────────────────────────────────────

export async function togglePinProjectAction(
  projectId: string,
  isPinned: boolean,
) {
  try {
    const dbUser =
      await ensureDbUser()

    await getOwnedProject(
      projectId,
      dbUser.id,
    )

    const updated =
      await db.project.update({
        where: {
          id: projectId,
        },

        data: {
          isPinned,
        },
      })

    revalidatePath('/dashboard')

    return {
      success: true as const,
      data: updated,
    }
  } catch (error: unknown) {
    console.error(
      '[Projects] Failed to toggle pin:',
      error,
    )

    return {
      success: false as const,
      error:
        getErrorMessage(error),
    }
  }
}

// ─────────────────────────────────────────────────────────────
// RENAME PROJECT
// ─────────────────────────────────────────────────────────────

export async function renameProjectAction(
  projectId: string,
  title: string,
) {
  try {
    const cleanTitle =
      title.trim()

    if (!cleanTitle) {
      throw new Error(
        'Project title cannot be empty',
      )
    }

    const dbUser =
      await ensureDbUser()

    await getOwnedProject(
      projectId,
      dbUser.id,
    )

    const updated =
      await db.project.update({
        where: {
          id: projectId,
        },

        data: {
          title: cleanTitle,
        },
      })

    revalidatePath('/dashboard')

    return {
      success: true as const,
      data: updated,
    }
  } catch (error: unknown) {
    console.error(
      '[Projects] Failed to rename project:',
      error,
    )

    return {
      success: false as const,
      error:
        getErrorMessage(error),
    }
  }
}