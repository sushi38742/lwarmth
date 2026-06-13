import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetName, targetTitle, targetCompany, connectionName, connectionTitle, connectionCompany, connectedThrough, matchType } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `You are writing a warm intro request message on behalf of a GTM team at Synopsis (B2B AI/data infrastructure).

Rules:
- Never claim the connection knows the target personally unless the match type is "Direct Person Match"
- For company/domain matches, use hedging: "if your relationship is strong enough", "if it makes sense"
- Be concise (3-4 sentences max), professional, and specific
- Do not hallucinate — only reference facts provided
- Address the team member by their connected-through name
- Do not mention Synopsis's product details — keep it context-setting only

Intro request details:
- Team member to contact: ${connectedThrough || '[Team Member]'}
- Their connection: ${connectionName || 'Unknown'}${connectionTitle ? ` (${connectionTitle})` : ''}${connectionCompany ? ` at ${connectionCompany}` : ''}
- Target we want to reach: ${targetName || 'Unknown'}${targetTitle ? ` (${targetTitle})` : ''}${targetCompany ? ` at ${targetCompany}` : ''}
- Match type: ${matchType || 'Unknown'}

Write only the message text, no subject line, no metadata.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ draft: content.trim() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
