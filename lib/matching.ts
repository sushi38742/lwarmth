import { NormalizedTarget, NormalizedConnection, MatchResult, WarmPathResult, WarmPathQuality } from './types';
import { detectSeniority } from './normalization';
import { scoreIcpFit } from './icp';

export function runMatching(targets: NormalizedTarget[], connections: NormalizedConnection[]): WarmPathResult[] {
  return targets.map((target, idx) => {
    const matches: MatchResult[] = [];

    for (const conn of connections) {
      const result = matchPair(target, conn);
      if (result) matches.push(result);
    }

    matches.sort((a, b) => b.connectionStrength - a.connectionStrength);

    const dataGaps = getDataGaps(target);
    const bestMatch = matches[0] || null;
    const quality = deriveQuality(bestMatch, dataGaps);
    const icp = scoreIcpFit(target);
    const lookupStatus = dataGaps.length > 0 ? 'Needs Review' : 'OK';

    let fallback = null, subjectLine = null, hook = null;
    if (!bestMatch || bestMatch.matchType === 'No Known Warm Path') {
      fallback = icp.angle;
      subjectLine = icp.subjectLine;
      hook = icp.firstCallHook;
    }

    return {
      id: `result-${idx}`,
      target,
      bestMatch,
      allMatches: matches,
      warmPathQuality: quality,
      dataGaps,
      lookupStatus,
      icpFitScore: icp.score,
      icpFitReason: icp.reason,
      fallbackOutreachAngle: fallback,
      suggestedSubjectLine: subjectLine,
      suggestedFirstCallHook: hook,
    };
  });
}

function matchPair(target: NormalizedTarget, conn: NormalizedConnection): MatchResult | null {
  if (target.normLinkedIn && conn.normLinkedIn && target.normLinkedIn === conn.normLinkedIn) {
    return {
      connection: conn,
      matchType: 'Direct Person Match',
      connectionStrength: 95,
      evidenceConfidence: 'High',
      reason: `${conn.rawConnectedThrough || 'Team member'} appears directly connected to ${target.rawName} via LinkedIn (profile slug match).`,
      suggestedNextAction: `Ask ${conn.rawConnectedThrough || 'your team member'} if they are comfortable reaching out directly to ${target.rawName}.`,
      introRequestDraft: buildDirectIntro(target, conn),
    };
  }

  if (target.normName && conn.normName && target.normName === conn.normName && target.normName.length > 3) {
    return {
      connection: conn,
      matchType: 'Direct Person Match',
      connectionStrength: 88,
      evidenceConfidence: 'High',
      reason: `${conn.rawConnectedThrough || 'Team member'} appears connected to ${target.rawName} by name match.`,
      suggestedNextAction: `Confirm this is the same person, then ask ${conn.rawConnectedThrough || 'your team member'} if they can reach out directly.`,
      introRequestDraft: buildDirectIntro(target, conn),
    };
  }

  if (target.normCompany && conn.normCompany && target.normCompany === conn.normCompany && target.normCompany.length > 2) {
    const seniority = detectSeniority(conn.rawTitle);
    const strength = seniority === 'executive' ? 82 : seniority === 'senior' ? 70 : seniority === 'mid' ? 55 : 42;
    return {
      connection: conn,
      matchType: 'Same Company Match',
      connectionStrength: strength,
      evidenceConfidence: 'High',
      reason: `${conn.rawName} works at ${target.rawCompany} (same company as target ${target.rawName}). Connected through ${conn.rawConnectedThrough || 'unknown'}. Human confirmation required.`,
      suggestedNextAction: `Ask ${conn.rawConnectedThrough || 'your team member'} whether their connection to ${conn.rawName} is strong enough to request an intro or internal direction at ${target.rawCompany}.`,
      introRequestDraft: buildCompanyIntro(target, conn),
    };
  }

  if (target.normDomain && conn.normDomain && target.normDomain === conn.normDomain && target.normDomain.length > 4) {
    const seniority = detectSeniority(conn.rawTitle);
    const strength = seniority === 'executive' ? 78 : seniority === 'senior' ? 65 : 50;
    return {
      connection: conn,
      matchType: 'Same Domain Match',
      connectionStrength: strength,
      evidenceConfidence: 'High',
      reason: `${conn.rawName} shares the domain ${target.normDomain} with target ${target.rawName}. Connected through ${conn.rawConnectedThrough || 'unknown'}.`,
      suggestedNextAction: `Verify both are at the same company. If confirmed, ask ${conn.rawConnectedThrough || 'your team member'} for direction or an intro at that account.`,
      introRequestDraft: buildCompanyIntro(target, conn),
    };
  }

  if (target.normCompany && conn.normPastCompany && target.normCompany === conn.normPastCompany && target.normCompany.length > 2) {
    return {
      connection: conn,
      matchType: 'Past Company Match',
      connectionStrength: 45,
      evidenceConfidence: 'Medium',
      reason: `${conn.rawName} previously worked at ${target.rawCompany} and may still have relationships there. Connected through ${conn.rawConnectedThrough || 'unknown'}.`,
      suggestedNextAction: `Ask ${conn.rawConnectedThrough || 'your team member'} whether ${conn.rawName} still has active relationships at ${target.rawCompany}.`,
      introRequestDraft: buildPastCompanyIntro(target, conn),
    };
  }

  return null;
}

function getDataGaps(target: NormalizedTarget): string[] {
  const gaps: string[] = [];
  if (!target.rawName) gaps.push('Missing target name');
  if (!target.rawCompany) gaps.push('Missing target company');
  if (!target.normLinkedIn) gaps.push('Missing LinkedIn URL');
  if (!target.normDomain && !target.rawEmail) gaps.push('Missing domain/email');
  return gaps;
}

function deriveQuality(bestMatch: MatchResult | null, dataGaps: string[]): WarmPathQuality {
  if (dataGaps.length >= 3) return 'Needs Data';
  if (!bestMatch) return 'None';

  const { connectionStrength, evidenceConfidence } = bestMatch;
  if (connectionStrength >= 85 && evidenceConfidence === 'High') return 'Strong';
  if (connectionStrength >= 60 && (evidenceConfidence === 'High' || evidenceConfidence === 'Medium')) return 'Good';
  if (connectionStrength >= 40) return 'Possible';
  if (connectionStrength >= 20) return 'Weak';
  return 'None';
}

function buildDirectIntro(target: NormalizedTarget, conn: NormalizedConnection): string {
  const owner = conn.rawConnectedThrough || '[Team Member]';
  return `${owner} — you appear to be directly connected to ${target.rawName}${target.rawTitle ? ` (${target.rawTitle})` : ''}${target.rawCompany ? ` at ${target.rawCompany}` : ''}. Would you be comfortable reaching out directly, or making a warm introduction for us? Happy to provide context on why we are reaching out.`;
}

function buildCompanyIntro(target: NormalizedTarget, conn: NormalizedConnection): string {
  const owner = conn.rawConnectedThrough || '[Team Member]';
  return `${owner} — noticed you're connected to ${conn.rawName}${conn.rawTitle ? ` (${conn.rawTitle})` : ''}${conn.rawCompany ? ` at ${conn.rawCompany}` : ''}. We're trying to connect with ${target.rawName} there. If your connection with ${conn.rawName} is strong enough, would it be worth asking whether they can point us in the right direction? No pressure — just checking if it's a path worth exploring.`;
}

function buildPastCompanyIntro(target: NormalizedTarget, conn: NormalizedConnection): string {
  const owner = conn.rawConnectedThrough || '[Team Member]';
  return `${owner} — ${conn.rawName} previously worked at ${target.rawCompany}, where we're trying to reach ${target.rawName}. Do you know if ${conn.rawName} still has active relationships there that might be worth a quick check?`;
}
