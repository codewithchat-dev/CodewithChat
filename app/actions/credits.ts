'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { MAX_DAILY_CREDITS } from '@/lib/credits'

async function ensureDbUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  let dbUser = await db.user.findUnique({
    where: { clerkId: userId },
  })

  if (!dbUser) {
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress || ''

    dbUser = await db.user.create({
      data: {
        clerkId: userId,
        email,
        credits: MAX_DAILY_CREDITS,
      },
    })
  }

  return dbUser
}

export async function getCreditsAction() {
  try {
    const dbUser = await ensureDbUser()
    return {
      success: true,
      credits: dbUser.credits,
      maxCredits: MAX_DAILY_CREDITS,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load credits'
    return { success: false, error: message, credits: 0, maxCredits: MAX_DAILY_CREDITS }
  }
}

export async function consumeCreditAction() {
  try {
    const dbUser = await ensureDbUser()
    if (dbUser.credits <= 0) {
      return { success: false, error: 'NO_CREDITS', credits: 0, maxCredits: MAX_DAILY_CREDITS }
    }

    const updated = await db.user.update({
      where: { id: dbUser.id },
      data: { credits: { decrement: 1 } },
    })

    return {
      success: true,
      credits: updated.credits,
      maxCredits: MAX_DAILY_CREDITS,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to use credit'
    return { success: false, error: message, credits: 0, maxCredits: MAX_DAILY_CREDITS }
  }
}
