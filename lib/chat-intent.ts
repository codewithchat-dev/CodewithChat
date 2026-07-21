export function isTrivialMessage(message: string): boolean {
  const trimmed = message.trim()
  if (!trimmed) return true
  if (trimmed.length < 3) return true
  if (/^[.!?…,\s]+$/.test(trimmed)) return true
  return false
}

export function isLikelyQuestion(message: string): boolean {
  const text = message.trim().toLowerCase()
  if (text.endsWith('?')) return true
  if (/^(how|what|why|when|where|can|could|should|is|are|do|does|kya|kaise|kyun|kahan)\b/.test(text)) {
    return true
  }
  if (/\b(explain|tell me|samjhao|batao|kaise hoga|kya hai)\b/i.test(text)) {
    return true
  }
  return false
}

const CODE_CHANGE_PATTERN =
  /\b(add|remove|delete|fix|update|change|implement|create|build|redesign|improve|make|replace|banao|karo|add karo|fix karo|backend|frontend|navbar|footer|cart|login|auth|database|supabase|api)\b/i

export function isLikelyCodeRequest(message: string): boolean {
  return CODE_CHANGE_PATTERN.test(message)
}

/** Questions stay chat-only; clear change requests regenerate code. */
export function shouldRegenerateCode(message: string): boolean {
  if (isTrivialMessage(message)) return false
  if (isLikelyCodeRequest(message)) return true
  if (isLikelyQuestion(message) && !isLikelyCodeRequest(message)) return false
  // Default: treat as a change request if it's a real sentence
  return message.trim().length >= 8
}
