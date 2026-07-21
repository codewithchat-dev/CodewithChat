export function isNextJsStack(tech: string): boolean {
  return /next/i.test(tech)
}

export function isVanillaStack(tech: string): boolean {
  return /html/i.test(tech)
}


