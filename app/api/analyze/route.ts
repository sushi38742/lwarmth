import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetName, targetTitle, targetCompany, targetDomain, targetNotes } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `You are an expert GTM analyst for Synopsis, a B2B AI/data infrastructure company.

Synopsis serves two ICP tracks:
1. PE/VC Operating Partners & Portfolio Companies — CFOs, COOs, CEOs at PE-backed companies needing consolidated operational data for investor/board reporting. Pain: disconnected systems, manual reporting, LP pressure.
2. Growth-Stage Operators — CEOs/COOs/CFOs at Series B-D companies scaling operations and needing real-time data visibility across functions.

Target details:
- Name: ${targetName || 'Unknown'}
- Title: ${targetTitle || 'Unknown'}
- Company: ${targetCompany || 'Unknown'}
- Domain: ${targetDomain || 'Unknown'}
- Notes: ${targetNotes || 'None'}

Analyze this target and return a JSON object with these exact fields:
{
  "icpFitScore": <number 0-100>,
  "icpFitReason": "<2-3 sentence explanation of why this score>",
  "track": "<'PE/VC Portfolio' | 'Growth Operator' | 'Unknown' | 'Low Fit'>",
  "likelyPainPoints": "<1-2 sentences on probable pain points>",
  "outreachAngle": "<2-3 sentences on how to approach this person specifically>",
  "subjectLine": "<compelling subject line under 60 chars>",
  "firstCallHook": "<opening question for first call, in quotes>",
  "whySynopsisMayMatter": "<1-2 sentences specific to this person's role>"
}

Base scores on: title seniority, PE/VC context signals, operational complexity, reporting burden signals. Return only valid JSON.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
