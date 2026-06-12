import { NormalizedTarget } from './types';

interface IcpResult {
  score: number;
  reason: string;
  angle: string;
  subjectLine: string;
  firstCallHook: string;
}

export function scoreIcpFit(target: NormalizedTarget): IcpResult {
  let score = 0;
  const reasons: string[] = [];
  const title = (target.rawTitle || '').toLowerCase();
  const notes = (target.rawNotes || '').toLowerCase();
  const company = (target.rawCompany || '').toLowerCase();
  const combined = title + ' ' + notes + ' ' + company;

  if (/\b(ceo|chief executive)\b/.test(title)) { score += 35; reasons.push('CEO at operator — primary ICP'); }
  else if (/\b(cfo|chief financial)\b/.test(title)) { score += 38; reasons.push('CFO — highest reporting pressure ICP'); }
  else if (/\b(coo|chief operating)\b/.test(title)) { score += 35; reasons.push('COO — operations-heavy ICP'); }
  else if (/\b(cro|chief revenue)\b/.test(title)) { score += 30; reasons.push('CRO — revenue data ICP'); }
  else if (/\b(cto|cio|chief (technology|information))\b/.test(title)) { score += 28; reasons.push('CTO/CIO — data/tech buyer ICP'); }
  else if (/\b(founder|co-founder)\b/.test(title)) { score += 32; reasons.push('Founder — key decision maker'); }
  else if (/\b(president)\b/.test(title)) { score += 30; reasons.push('President — senior operator'); }

  if (/\b(operating partner)\b/.test(title)) { score += 40; reasons.push('Operating Partner — portfolio facilitator ICP'); }
  else if (/\b(managing director)\b/.test(title)) { score += 35; reasons.push('Managing Director — senior PE/VC ICP'); }
  else if (/\b(partner)\b/.test(title) && /\b(pe|vc|capital|fund|equity|venture)\b/.test(combined)) { score += 30; reasons.push('Fund partner with portfolio influence'); }

  if (/\b(vp|vice president|svp|evp)\b/.test(title) && score < 25) { score += 20; reasons.push('Senior VP role'); }
  else if (/\b(head of|director)\b/.test(title) && score < 20) { score += 15; reasons.push('Director-level role'); }

  if (/\b(pe.backed|pe backed|private equity|portfolio company|backed by)\b/.test(combined)) { score += 20; reasons.push('PE-backed context detected'); }
  if (/\b(vc.backed|vc backed|venture.backed|venture backed)\b/.test(combined)) { score += 15; reasons.push('VC-backed context detected'); }

  if (/\b(healthcare|health|medical|clinical)\b/.test(combined)) { score += 8; reasons.push('Healthcare sector'); }
  if (/\b(logistics|supply chain|operations|manufacturing)\b/.test(combined)) { score += 8; reasons.push('Operations-heavy industry'); }
  if (/\b(reporting|data|analytics|intelligence|visibility)\b/.test(combined)) { score += 10; reasons.push('Data/reporting pain signals'); }
  if (/\b(investor|board|lp|limited partner)\b/.test(combined)) { score += 12; reasons.push('Investor/board reporting pressure'); }

  score = Math.min(100, score);

  return {
    score,
    reason: reasons.length > 0 ? reasons.join('. ') : 'Limited ICP signals in available data.',
    angle: buildAngle(target, score),
    subjectLine: buildSubjectLine(target),
    firstCallHook: buildHook(target),
  };
}

function buildAngle(target: NormalizedTarget, score: number): string {
  const title = (target.rawTitle || '').toLowerCase();
  const company = target.rawCompany || 'your company';

  if (/cfo|chief financial/.test(title)) {
    return `Lead with data visibility and investor/board reporting burden. ${company} likely deals with disconnected operating data that makes consolidated reporting time-intensive. Synopsis helps CFOs get clean, real-time reporting without manual aggregation.`;
  }
  if (/coo|chief operating/.test(title)) {
    return `Lead with operational data consolidation. COOs at portfolio companies are often dealing with disparate systems and fragmented data. Synopsis surfaces what's happening across operations in real time.`;
  }
  if (/ceo|chief executive|president/.test(title)) {
    return `Lead with the board/investor reporting narrative. CEOs under PE/VC pressure need to move fast on reporting. Synopsis helps them get ahead of board decks and investor requests without pulling in the whole team.`;
  }
  if (/operating partner|managing director/.test(title)) {
    return `Lead with portfolio-wide visibility. Operating partners need to see what's happening across multiple portfolio companies simultaneously. Synopsis can give that cross-portfolio view without building custom data infrastructure at each company.`;
  }
  if (score >= 50) {
    return `This target shows strong ICP signals. Lead with the reporting and data visibility pain point — ask how their team currently consolidates operational data for leadership, board, or investor reporting.`;
  }
  return `Limited ICP signals available. Research ${company} further before outreach. If they are an operations-heavy or PE-backed business, Synopsis may still be relevant.`;
}

function buildSubjectLine(target: NormalizedTarget): string {
  const title = (target.rawTitle || '').toLowerCase();
  const company = target.rawCompany || 'your business';
  if (/cfo|financial/.test(title)) return `How ${company} consolidates operating data for investor reporting`;
  if (/coo|operating/.test(title)) return `Operational visibility across ${company}`;
  if (/ceo|president/.test(title)) return `Faster board/investor reporting for ${company}`;
  if (/operating partner/.test(title)) return `Portfolio-wide data visibility — worth 15 minutes?`;
  return `Quick question about ${company}'s reporting process`;
}

function buildHook(target: NormalizedTarget): string {
  const title = (target.rawTitle || '').toLowerCase();
  if (/cfo/.test(title)) return `"Worth a quick conversation on how your team currently consolidates operating data for investor and board reporting?"`;
  if (/coo/.test(title)) return `"Curious how you're currently getting real-time visibility across your operations — is that something that still involves a lot of manual work?"`;
  if (/ceo|president/.test(title)) return `"How much time does your team spend pulling together the data for your board decks and investor updates right now?"`;
  if (/operating partner/.test(title)) return `"Are any of your portfolio companies still relying on manual processes to get you their operating metrics?"`;
  return `"How does your team currently handle consolidated reporting — is that mostly manual, or do you have systems in place?"`;
}
