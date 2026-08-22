// ─────────────────────────────────────────────────────────────
// BASIC MESSAGE CHECKS
// ─────────────────────────────────────────────────────────────

export function isTrivialMessage(
  message: string,
): boolean {
  const trimmed = message.trim()

  if (!trimmed) return true
  if (trimmed.length < 2) return true

  // Only punctuation / whitespace
  if (/^[.!?…,\s]+$/.test(trimmed)) {
    return true
  }

  return false
}

// ─────────────────────────────────────────────────────────────
// QUESTION DETECTION
// ─────────────────────────────────────────────────────────────

export function isLikelyQuestion(
  message: string,
): boolean {
  const text = message
    .trim()
    .toLowerCase()

  if (!text) return false

  if (text.endsWith('?')) {
    return true
  }

  // English question starters
  if (
    /^(how|what|why|when|where|which|who|can|could|should|would|is|are|do|does|did|will)\b/i.test(
      text,
    )
  ) {
    return true
  }

  // Hindi / Hinglish question starters
  if (
    /^(kya|kaise|kyu|kyun|kab|kahan|kaun|kon|kis|kitna|kitne)\b/i.test(
      text,
    )
  ) {
    return true
  }

  // Explanation-style questions
  if (
    /\b(explain|tell me|samjhao|samjha do|batao|btao|kya hai|kya h|kaise hota|kaise hoga|how does|how to|what is)\b/i.test(
      text,
    )
  ) {
    return true
  }

  return false
}

// ─────────────────────────────────────────────────────────────
// CODE CHANGE DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * Actual ACTION words.
 *
 * Important:
 * Do NOT put nouns like:
 *
 * supabase
 * database
 * backend
 * login
 *
 * here by themselves.
 *
 * Otherwise "Supabase kya hai?" would consume a credit.
 */
const CHANGE_ACTION_PATTERN =
  /\b(add|remove|delete|fix|update|change|modify|implement|create|build|redesign|improve|replace|integrate|connect|configure|setup|install|enable|disable|generate|convert|move|rename|refactor|make|use)\b/i

const HINGLISH_CHANGE_PATTERN =
  /\b(banao|bana do|bnado|bna do|karo|kar do|krdo|kr do|lagao|laga do|jodo|jod do|hatao|hata do|badlo|badal do|change karo|add karo|fix karo|update karo|connect karo|integrate karo|setup karo)\b/i

/**
 * Requests that imply a desired change even without a normal action verb.
 *
 * Examples:
 *
 * "navbar blue chahiye"
 * "mujhe login page chahiye"
 * "dark mode hona chahiye"
 */
const DESIRED_CHANGE_PATTERN =
  /\b(chahiye|chaiye|hona chahiye|karna hai|krna hai|add hona|remove hona|i want|i need|needs to be|should have|should be)\b/i

/**
 * Some direct coding commands can be extremely short.
 */
const DIRECT_COMMAND_PATTERN =
  /^(add|remove|fix|change|update|create|build|make|implement|connect|integrate|setup|banao|bnado|karo|krdo|hatao|badlo)\b/i

export function isLikelyCodeRequest(
  message: string,
): boolean {
  const text = message.trim()

  if (!text) return false

  if (DIRECT_COMMAND_PATTERN.test(text)) {
    return true
  }

  if (CHANGE_ACTION_PATTERN.test(text)) {
    return true
  }

  if (HINGLISH_CHANGE_PATTERN.test(text)) {
    return true
  }

  if (DESIRED_CHANGE_PATTERN.test(text)) {
    return true
  }

  return false
}

// ─────────────────────────────────────────────────────────────
// FINAL ROUTING DECISION
// ─────────────────────────────────────────────────────────────

/**
 * true:
 *   Send to /api/generate-plan
 *   → code changes
 *   → consumes 1 generation credit
 *
 * false:
 *   Send to /api/project-chat
 *   → question / explanation
 *   → consumes 0 generation credits
 */
export function shouldRegenerateCode(
  message: string,
): boolean {
  if (isTrivialMessage(message)) {
    return false
  }

  // Explicit change request always wins.
  //
  // Example:
  // "Can you add Supabase login?"
  //
  // It looks like a question grammatically,
  // but it clearly asks for a code change.
  if (isLikelyCodeRequest(message)) {
    return true
  }

  // Informational question
  if (isLikelyQuestion(message)) {
    return false
  }

  /**
   * IMPORTANT:
   *
   * Unknown/ambiguous messages stay chat-only.
   *
   * We do NOT automatically consume a user's credit
   * just because they wrote a normal sentence.
   */
  return false
}