import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, rating, feedback } = body;

    // Securely hitting the webhook from the server side prevents malicious users 
    // from extracting this URL from the browser network tab.
    const webhookUrl = "https://discord.com/api/webhooks/1513107613980823632/v9jpfN-VpJ5BOGHX3pY9vnC-UJBrhCRcPRYD1417Rvt1gd68w8GoVCNgiNArWolxt7qS";

    const emojiMap = {
      bad: '😞 Poor',
      neutral: '😐 Okay',
      good: '😃 Great',
    };

    const discordPayload = {
      embeds: [
        {
          title: "New User Feedback! 🚨",
          color: 5814783, // Discord Blurple
          fields: [
            {
              name: "User Account",
              value: user || "Anonymous User",
              inline: true
            },
            {
              name: "Experience Rating",
              value: rating ? emojiMap[rating as keyof typeof emojiMap] : "No rating given",
              inline: true
            },
            {
              name: "Feedback Message",
              value: feedback || "No text provided"
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback webhook error:', error);
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
  }
}
