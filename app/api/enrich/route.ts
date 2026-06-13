import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, linkedinSlug, emailDomain } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `Given the following partial information about a person, infer their likely company and title if possible. Only infer from signals actually present — do not hallucinate.

Name: ${name || 'Unknown'}
LinkedIn slug: ${linkedinSlug || 'not available'}
Email domain: ${emailDomain || 'not available'}

Return JSON:
{
  "inferredCompany": "<company name or null>",
  "inferredTitle": "<title or null>",
  "confidence": "<'high' | 'medium' | 'low'>",
  "reasoning": "<one sentence>"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
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
