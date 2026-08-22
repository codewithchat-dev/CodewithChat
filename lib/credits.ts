export const MAX_DAILY_CREDITS = 5

export function creditsUsed(
  maxCredits: number,
  remaining: number,
): number {
  const safeMax = Math.max(0, maxCredits)
  const safeRemaining = Math.min(
    safeMax,
    Math.max(0, remaining),
  )

  return safeMax - safeRemaining
}

export function creditsProgress(
  maxCredits: number,
  remaining: number,
): number {
  if (maxCredits <= 0) return 0

  const used = creditsUsed(maxCredits, remaining)

  return Math.min(
    100,
    Math.max(0, (used / maxCredits) * 100),
  )
}