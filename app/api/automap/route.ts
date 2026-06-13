import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { headers, sampleRows, kind } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const fields = kind === 'target'
      ? ['name', 'company', 'title', 'linkedinUrl', 'email', 'domain', 'notes']
      : ['name', 'company', 'title', 'linkedinUrl', 'email', 'connectedThrough', 'pastCompany'];

    const fieldDescriptions: Record<string, string> = {
      name: 'person\'s full name',
      company: 'current company / employer / organization',
      title: 'job title / role / position',
      linkedinUrl: 'LinkedIn profile URL',
      email: 'email address',
      domain: 'company web domain (e.g. acme.com)',
      notes: 'free-text notes or description',
      connectedThrough: 'which teammate / team member knows / introduced this connection (e.g. "via Justin")',
      pastCompany: 'previous employer / past company / former employer',
    };

    const sample = (sampleRows || []).slice(0, 3);

    const prompt = `You are mapping spreadsheet columns to standardized fields.

This is a ${kind === 'target' ? 'TARGET PROSPECTS' : 'TEAM CONNECTIONS'} file.

Headers in the file: ${JSON.stringify(headers)}

First few rows (sample data): ${JSON.stringify(sample)}

Map each standardized field below to the BEST matching column header from the file, or null if no column fits.

Standardized fields:
${fields.map(f => `- ${f}: ${fieldDescriptions[f]}`).join('\n')}

Use both header NAMES and sample DATA to decide. Examples: a column called "Owner" with team member first names (Justin, Kris) should map to connectedThrough. A column with URLs containing "linkedin.com" maps to linkedinUrl.

Return ONLY valid JSON in this exact shape:
{
  "mapping": { "name": "<header or null>", "company": "<header or null>", ... all fields ... },
  "reasoning": "<one short sentence on key decisions>"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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

    const clean: Record<string, string> = {};
    if (parsed.mapping) {
      for (const k of Object.keys(parsed.mapping)) {
        const v = parsed.mapping[k];
        if (v && headers.includes(v)) clean[k] = v;
      }
    }

    return NextResponse.json({ mapping: clean, reasoning: parsed.reasoning || '' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
