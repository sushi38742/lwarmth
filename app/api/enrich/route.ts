import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const ENRICH_SYSTEM_PROMPT = `You are a business intelligence assistant helping identify a professional's current company and title from limited available signals.

You will receive:
- A person's full name
- Their LinkedIn URL slug (the part after linkedin.com/in/)
- Their email domain (if available)
- Any notes about them

Your job: Based on what you can reasonably infer from the LinkedIn slug, email domain, and name, estimate their most likely current company and title. 

IMPORTANT RULES:
- If the email domain is a generic provider (gmail, yahoo, hotmail, outlook, icloud), ignore it for company identification.
- If the LinkedIn slug contains a company name hint, use it carefully.
- If the email domain is a business domain, it likely indicates their company.
- Do NOT guess if you have no meaningful signals. Set confidence to 'none' if you genuinely cannot determine anything.
- Never fabricate a company. Only return a company if you have a reasonable signal.
- Return ONLY valid JSON.

JSON schema:
{
  "inferredCompany": "<company name or null>",
  "inferredTitle": "<possible title or null>",
  "confidence": "<'high' | 'medium' | 'low' | 'none'>",
  "reasoning": "<1 sentence explaining what signal you used>",
  "domainUsed": "<the domain or signal that led to this inference, or null>"
}`;

async function callGroq(messages: { role: string; content: string }[]) {
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
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
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
    const { name, linkedinSlug, emailDomain, notes } = body;

    if (!name && !linkedinSlug && !emailDomain) {
      return NextResponse.json({ error: 'No signals provided to enrich from' }, { status: 400 });
    }

    const userMessage = `Identify company/title for this person:

Name: ${name || 'Unknown'}
LinkedIn slug: ${linkedinSlug || 'Not available'}
Email domain: ${emailDomain || 'Not available'}
Notes: ${notes || 'None'}

Return your best inference as JSON.`;

    const content = await callGroq([
      { role: 'system', content: ENRICH_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Enrich error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Enrichment failed' },
      { status: 500 }
    );
  }
}
