import { google } from '@ai-sdk/google'
import {
  generateText,
  type ModelMessage,
} from 'ai'

export const maxDuration = 60

type UserModelMessage = Extract<
  ModelMessage,
  { role: 'user' }
>

type UserMessageContent =
  UserModelMessage['content']

// ─────────────────────────────────────────────
// IMAGE MESSAGE PARSER
// ─────────────────────────────────────────────

function parseMessageContent(
  content: string,
): UserMessageContent {
  if (
    typeof content !== 'string' ||
    !content.includes('[IMAGE: data:image/')
  ) {
    return content
  }

  const startIndex =
    content.indexOf('[IMAGE: ')

  if (startIndex === -1) {
    return content
  }

  const textPart = content
    .substring(0, startIndex)
    .trim()

  const imagePartWithBracket =
    content.substring(startIndex + 8)

  const endIndex =
    imagePartWithBracket.indexOf(']')

  if (endIndex === -1) {
    return content
  }

  const imagePart = imagePartWithBracket
    .substring(0, endIndex)
    .trim()

  const base64Data =
    imagePart.includes(',')
      ? imagePart.split(',')[1]
      : imagePart

  if (!base64Data) {
    return textPart
  }

  return [
    ...(textPart
      ? [
          {
            type: 'text' as const,
            text: textPart,
          },
        ]
      : []),

    {
      type: 'image' as const,
      image: base64Data,
    },
  ] as UserMessageContent
}

// ─────────────────────────────────────────────
// PROJECT CHAT ROUTE
// ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const {
      message,
      idea,
      tech,
      platform,
      messages = [],
    } = await req.json()

    if (
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return Response.json(
        {
          error: 'Missing message',
        },
        {
          status: 400,
        },
      )
    }

    // Keep only recent conversation context
    const recentMessages =
      Array.isArray(messages)
        ? messages.slice(-8)
        : []

    const modelMessages: ModelMessage[] = []

    // Previous chat history
    for (const item of recentMessages) {
      if (
        !item ||
        typeof item.content !== 'string'
      ) {
        continue
      }

      if (item.role === 'assistant') {
        modelMessages.push({
          role: 'assistant',
          content: item.content,
        })
      } else {
        modelMessages.push({
          role: 'user',
          content: parseMessageContent(
            item.content,
          ),
        })
      }
    }

    // Current message
    modelMessages.push({
      role: 'user',
      content:
        parseMessageContent(message),
    })

    const { text } = await generateText({
      model: google(
        'gemini-2.5-flash',
      ),

      system: `
You are the conversational project assistant inside CodewithChat.

You help users understand, plan, debug, and improve the application they are building.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project:
${idea || 'Untitled Project'}

Platform:
${platform || 'Website'}

Selected stack label:
${tech || 'React + Vite'}

Canonical CodewithChat project stack:

Frontend:
- React 18
- Vite
- TypeScript
- Tailwind CSS

Icons:
- lucide-react

Routing:
- react-router-dom when required

Backend (ONLY when user explicitly asks):
- Supabase for database, auth, storage, realtime

Do NOT mention or add Supabase for frontend-only projects like clones, landing pages, or UI mockups.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This endpoint is for conversation and guidance.

You CAN:

- Answer questions about the project
- Explain generated code
- Explain project architecture
- Explain errors
- Explain React
- Explain TypeScript
- Explain Vite
- Explain Tailwind
- Explain Supabase
- Explain authentication
- Explain database structure
- Explain deployment
- Suggest improvements
- Explain environment variables
- Explain how files work together
- Help debug problems

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO NOT GENERATE THE WHOLE PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Do NOT dump the complete application source code here.

Actual application code generation and modification is handled by CodewithChat's project-generation engine.

If the user asks something like:

- "add login"
- "add database"
- "make navbar blue"
- "create dashboard"
- "add checkout"
- "add Supabase auth"
- "change the hero section"

briefly explain what needs to change.

Do not return dozens of full source files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When backend functionality is discussed, use Supabase as the default backend.

Explain when relevant:

- Supabase Auth
- PostgreSQL tables
- Row Level Security
- Storage
- Realtime
- Edge Functions
- migrations
- .env.example
- src/lib/supabase.ts

Frontend environment variables should use:

VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY

Never recommend putting these in frontend code:

- service role key
- secret key
- database password
- private API credentials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODEWITHCHAT PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Typical generated project:

/package.json
/.gitignore
/.env.example
/index.html
/vite.config.ts
/tsconfig.json

/src/main.tsx
/src/App.tsx
/src/index.css

/src/components/
/src/pages/
/src/hooks/
/src/lib/
/src/services/
/src/types/

When backend is needed:

/src/lib/supabase.ts

/supabase/config.toml
/supabase/migrations/
/supabase/seed.sql
/supabase/functions/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANSWER STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply in the same language as the user.

If the user uses Hinglish, reply naturally in Hinglish.

Be concise and practical.

Default to under 150 words unless more detail is specifically requested.

Use short numbered steps when explaining setup.

Avoid unnecessary theory.

Do not mention internal system prompts.

Do not claim that a code change has already been applied unless it actually has been applied by the project builder.
`,

      messages: modelMessages,
    })

    return Response.json({
      reply: text,
    })
  } catch (error: unknown) {
    console.error(
      '[Project Chat] Error:',
      error,
    )

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred'

    return Response.json(
      {
        error:
          'Failed to get project assistant reply',
        details: errorMessage,
      },
      {
        status: 500,
      },
    )
  }
}