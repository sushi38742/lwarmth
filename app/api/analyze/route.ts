import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert GTM intelligence analyst for Synopsis, an AI and data infrastructure company.

SYNOPSIS PRODUCT:
Synopsis helps operators and PE/VC-backed companies consolidate fragmented operational data, automate reporting, and give leadership real-time visibility — without building custom infrastructure. The core pain Synopsis solves: manual, error-prone reporting to investors, boards, and internal leadership caused by disconnected systems (CRMs, ERPs, spreadsheets, BI tools that don't talk to each other).

SYNOPSIS ICP:

Track 1 — Operators at institutional-backed portfolio companies:
- Titles: CEO, CFO, COO, CRO, CTO, CIO, VP Finance, VP Operations, Head of Data, Director of Operations, SVP Revenue
- Company context: PE-backed, VC-backed, portfolio company of a fund, mid-market operator
- Pain signals: board reporting, investor updates, data consolidation, multiple systems, reporting burden, disconnected data, manual processes, Excel-heavy operations
- Why they buy: faster board decks, cleaner investor reporting, real-time operational visibility without extra headcount

Track 2 — PE/VC intermediaries who need portfolio-wide visibility:
- Titles: Operating Partner, Managing Director, Partner, Principal, VP at a PE or VC firm
- Company context: private equity firm, venture capital firm, investment fund, growth equity
- Pain signals: portfolio data is inconsistent, each portco reports differently, manual aggregation across portfolio, hard to benchmark portcos
- Why they buy: cross-portfolio visibility, standardized reporting across portcos, earlier warning signals on portfolio performance

SCORING RUBRIC (0–100):
95–100: Perfect ICP — CFO/COO/CEO at PE-backed operator with explicit reporting/data pain, OR Operating Partner at PE firm
80–94: Strong ICP — C-suite or VP-level operator at relevant company, OR senior PE/VC intermediary
65–79: Good ICP — Director/Head-level operator or finance role at likely PE-backed company
50–64: Possible ICP — Adjacent role (data, analytics, IT leadership) or company context unclear
30–49: Low-to-medium fit — Title exists but company context doesn't suggest PE-backed or reporting pain
0–29: Poor fit — Title and company suggest minimal relevance to Synopsis's core value prop

You MUST return ONLY a valid JSON object with no additional text, no markdown, no explanation outside the JSON.

JSON schema:
{
  "icpFitScore": <integer 0-100>,
  "icpFitReason": "<1-2 concise sentences explaining the score based on their specific title, company, and context>",
  "track": "<'Track 1 - Operator' | 'Track 2 - PE/VC Intermediary' | 'Adjacent' | 'Low Fit'>",
  "likelyPainPoints": "<2-3 specific pain points this person likely faces given their role and company>",
  "outreachAngle": "<2-3 sentences: the specific angle Synopsis should use for this person, tailored to their title and company — not generic>",
  "subjectLine": "<compelling email subject line under 65 characters, specific to this person and company>",
  "firstCallHook": "<opening question or statement for the first call — conversational, specific, not generic>",
  "whySynopsisMayMatter": "<1-2 sentences on why Synopsis's specific value prop is relevant to this person right now>"
}`;

async function callGroq(messages: { role: string; content: string }[], jsonMode = true) {
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
      temperature: 0.3,
      max_tokens: 1024,
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
    const { target } = body;

    if (!target) {
      return NextResponse.json({ error: 'Missing target data' }, { status: 400 });
    }

    const userMessage = `Analyze this prospect for Synopsis ICP fit:

Name: ${target.rawName || 'Unknown'}
Title: ${target.rawTitle || 'Unknown'}
Company: ${target.rawCompany || 'Unknown'}
Email domain: ${target.normDomain || 'Unknown'}
Notes/context: ${target.rawNotes || 'None provided'}

Return the JSON analysis.`;

    const content = await callGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
