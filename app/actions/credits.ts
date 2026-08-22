'use server'

import {
  auth,
  currentUser,
} from '@clerk/nextjs/server'

import { db } from '@/lib/db'
import { MAX_DAILY_CREDITS } from '@/lib/credits'

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong'
}

/**
 * IMPORTANT:
 *
 * Keep this logic identical to /api/generate-plan.
 *
 * Credits currently reset according to the UTC calendar day.
 */
function isDifferentUtcDay(
  previous: Date,
  current: Date,
): boolean {
  return (
    previous.getUTCFullYear() !==
      current.getUTCFullYear() ||
    previous.getUTCMonth() !==
      current.getUTCMonth() ||
    previous.getUTCDate() !==
      current.getUTCDate()
  )
}

// ─────────────────────────────────────────────────────────────
// ENSURE DATABASE USER
// ─────────────────────────────────────────────────────────────

async function ensureDbUser() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  let dbUser =
    await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

  if (dbUser) {
    return dbUser
  }

  const user =
    await currentUser()

  const email =
    user?.emailAddresses?.[0]
      ?.emailAddress ??
    `${userId}@placeholder.local`

  const now = new Date()

  try {
    dbUser =
      await db.user.create({
        data: {
          clerkId: userId,
          email,
          credits:
            MAX_DAILY_CREDITS,
          lastCreditResetAt: now,
        },
      })

    return dbUser
  } catch (error) {
    /**
     * Another request may have created
     * the user at the same time.
     */
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
// DAILY RESET
// ─────────────────────────────────────────────────────────────

async function getUserWithDailyCredits() {
  let dbUser =
    await ensureDbUser()

  const now = new Date()

  const shouldReset =
    !dbUser.lastCreditResetAt ||
    isDifferentUtcDay(
      dbUser.lastCreditResetAt,
      now,
    )

  if (!shouldReset) {
    return dbUser
  }

  dbUser =
    await db.user.update({
      where: {
        id: dbUser.id,
      },

      data: {
        credits:
          MAX_DAILY_CREDITS,

        lastCreditResetAt: now,
      },
    })

  return dbUser
}

// ─────────────────────────────────────────────────────────────
// GET CREDITS
// ─────────────────────────────────────────────────────────────

export async function getCreditsAction() {
  try {
    const dbUser =
      await getUserWithDailyCredits()

    return {
      success: true as const,

      credits:
        dbUser.credits,

      maxCredits:
        MAX_DAILY_CREDITS,
    }
  } catch (error: unknown) {
    console.error(
      '[Credits] Failed to load credits:',
      error,
    )

    return {
      success: false as const,

      error:
        getErrorMessage(error),

      credits: 0,

      maxCredits:
        MAX_DAILY_CREDITS,
    }
  }
}

// ─────────────────────────────────────────────────────────────
// CONSUME CREDIT
// ─────────────────────────────────────────────────────────────

/**
 * Compatibility action.
 *
 * IMPORTANT:
 *
 * /api/generate-plan already consumes the generation credit.
 *
 * Do NOT call this action as well when generating code,
 * otherwise one generation could consume TWO credits.
 *
 * Keep this only if another part of the app still imports it.
 */
export async function consumeCreditAction() {
  try {
    const dbUser =
      await getUserWithDailyCredits()

    /**
     * Atomic guard:
     * only decrement if credits are still > 0.
     *
     * This prevents credits becoming negative if
     * multiple requests happen nearly simultaneously.
     */
    const result =
      await db.user.updateMany({
        where: {
          id: dbUser.id,

          credits: {
            gt: 0,
          },
        },

        data: {
          credits: {
            decrement: 1,
          },
        },
      })

    if (result.count === 0) {
      return {
        success: false as const,

        error: 'NO_CREDITS',

        credits: 0,

        maxCredits:
          MAX_DAILY_CREDITS,
      }
    }

    const updated =
      await db.user.findUnique({
        where: {
          id: dbUser.id,
        },
      })

    if (!updated) {
      throw new Error(
        'User not found after credit update',
      )
    }

    return {
      success: true as const,

      credits:
        updated.credits,

      maxCredits:
        MAX_DAILY_CREDITS,
    }
  } catch (error: unknown) {
    console.error(
      '[Credits] Failed to consume credit:',
      error,
    )

    return {
      success: false as const,

      error:
        getErrorMessage(error),

      credits: 0,

      maxCredits:
        MAX_DAILY_CREDITS,
    }
  }
}