import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const DRAFT_SYSTEM_PROMPT = `You are a GTM assistant for Synopsis, an AI/data infrastructure company. Your job is to write warm intro request messages that a Synopsis team member sends to a colleague asking them to facilitate a connection.

RULES FOR INTRO DRAFTS:
1. Maximum 3 sentences. Short and human — not a sales pitch.
2. Address the message to the team member (the "connected through" person), not the target.
3. Never claim the team member personally knows the target prospect unless the match is a Direct Person Match.
4. For company-level matches: say they're connected to someone AT the company, not that they know the target.
5. Use natural hedging: "if your connection is strong enough", "worth a quick ask", "no pressure at all".
6. End with an easy out: "No pressure — just flagging it as a possible path."
7. Be specific about WHO they're connected to and WHY we want to reach the target.
8. Do NOT write a generic message. Reference the actual names, title, and company.
9. Return ONLY the message text. No subject line, no greeting header, no explanation.

TONE: Professional but casual. Like a Slack message to a colleague, not a formal email.

EXAMPLE for same-company match:
"Hey Justin — noticed you're connected to Sarah Jones (VP Sales at ABC Health). We're trying to reach Julie Smith, their CFO, about how they're handling investor reporting. If your connection with Sarah is solid, would it be worth a quick ask whether she could point us in the right direction? No pressure at all."

EXAMPLE for direct match:
"Hey Daniel — looks like you're directly connected to Mark Lee, COO at Northstar Logistics. We'd love to get in front of him given their operations setup. Would you be comfortable making a quick intro if the timing feels right? Happy to give you full context first."

EXAMPLE for past-company match:
"Hey Kris — Emily Brown used to work at Northstar Logistics, and that's an account we're trying to get into (specifically their COO, Mark Lee). Do you know if Emily still has relationships there? Might be worth a quick check if it feels natural."`;

async function callGroq(messages: { role: string; content: string }[], jsonMode = false) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 300,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, connection, matchType } = body;

    if (!target || !connection) {
      return NextResponse.json({ error: 'Missing target or connection data' }, { status: 400 });
    }

    const userMessage = `Write an intro request for this specific situation:

Team member to address: ${connection.rawConnectedThrough || '[Team Member]'}
Their connection: ${connection.rawName}${connection.rawTitle ? `, ${connection.rawTitle}` : ''}${connection.rawCompany ? ` at ${connection.rawCompany}` : ''}
Target we want to reach: ${target.rawName}${target.rawTitle ? `, ${target.rawTitle}` : ''}${target.rawCompany ? ` at ${target.rawCompany}` : ''}
Match type: ${matchType}

Write the intro request message now:`;

    const content = await callGroq([
      { role: 'system', content: DRAFT_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    return NextResponse.json({ draft: content.trim() });
  } catch (error) {
    console.error('Draft error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Draft generation failed' },
      { status: 500 }
    );
  }
}
