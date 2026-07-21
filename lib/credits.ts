export const MAX_DAILY_CREDITS = 5

export function creditsUsed(maxCredits: number, remaining: number): number {
  return Math.max(0, maxCredits - remaining)
}

export function creditsProgress(maxCredits: number, remaining: number): number {
  return (creditsUsed(maxCredits, remaining) / maxCredits) * 100
}
