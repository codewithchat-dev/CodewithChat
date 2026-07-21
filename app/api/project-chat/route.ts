import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export const maxDuration = 60

function parseMessageContent(content: string) {
  if (typeof content !== 'string' || !content.includes('[IMAGE: data:image/')) {
    return content;
  }
  const startIndex = content.indexOf('[IMAGE: ');
  const textPart = content.substring(0, startIndex).trim();
  const imagePartWithBracket = content.substring(startIndex + 8);
  const endIndex = imagePartWithBracket.indexOf(']');
  const imagePartStr = imagePartWithBracket.substring(0, endIndex).trim();
  
  const base64Data = imagePartStr.includes(',') ? imagePartStr.split(',')[1] : imagePartStr;

  return [
    ...(textPart ? [{ type: 'text' as const, text: textPart }] : []),
    { type: 'image' as const, image: base64Data }
  ];
}

export async function POST(req: Request) {
  try {
    const { message, idea, tech, platform, messages = [] } = await req.json()

    if (!message?.trim() && !message?.includes('[IMAGE:')) {
      return new Response(JSON.stringify({ error: 'Missing message' }), { status: 400 })
    }

    const history = messages
      .slice(-8)
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: parseMessageContent(m.content),
      }))

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: `You are a friendly expert assistant for CodewithChat AI Studio.

Project: ${idea}
Platform: ${platform}
Tech stack: ${tech}

Your job is to ANSWER QUESTIONS and give guidance — do NOT dump full project code.
- If they ask about backend: explain Supabase setup (auth, tables, env vars) in plain steps.
- If they ask how to integrate something: give a short numbered plan, not code files.
- Keep answers under 150 words unless they ask for detail.
- Reply in the same language the user uses (Hindi/English/Hinglish).
- End with one clear next step like: "Say 'Add Supabase auth' when you want me to update the code."`,
      messages: [
        ...history,
        { role: 'user', content: parseMessageContent(message) },
      ],
    })

    return Response.json({ reply: text })
  } catch (error: unknown) {
    console.error('Project chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get reply' }), { status: 500 })
  }
}
