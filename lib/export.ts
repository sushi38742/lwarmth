import { WarmPathResult } from './types';

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function row(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCsv).join(',');
}

export function exportFullResults(results: WarmPathResult[]): string {
  const headers = [
    'Target Name', 'Target Title', 'Target Company', 'Target LinkedIn', 'Target Email',
    'Warm Path Quality', 'Match Type', 'Best Connection', 'Connected Through',
    'Connection Strength', 'Evidence Confidence', 'Reason',
    'Suggested Next Action', 'Intro Request Draft',
    'ICP Fit Score', 'ICP Fit Reason',
    'Fallback Angle', 'Suggested Subject Line', 'First Call Hook',
    'Data Gaps', 'Lookup Status'
  ];

  const rows = results.map(r => row([
    r.target.rawName, r.target.rawTitle, r.target.rawCompany,
    r.target.rawLinkedIn, r.target.rawEmail,
    r.warmPathQuality,
    r.bestMatch?.matchType || '',
    r.bestMatch?.connection.rawName || '',
    r.bestMatch?.connection.rawConnectedThrough || '',
    r.bestMatch?.connectionStrength || '',
    r.bestMatch?.evidenceConfidence || '',
    r.bestMatch?.reason || '',
    r.bestMatch?.suggestedNextAction || '',
    r.bestMatch?.introRequestDraft || '',
    r.icpFitScore,
    r.icpFitReason,
    r.fallbackOutreachAngle || '',
    r.suggestedSubjectLine || '',
    r.suggestedFirstCallHook || '',
    r.dataGaps.join('; '),
    r.lookupStatus,
  ]));

  return [row(headers), ...rows].join('\n');
}

export function exportIntroRequests(results: WarmPathResult[]): string {
  const eligible = results.filter(r =>
    r.bestMatch && ['Direct Person Match', 'Same Company Match', 'Same Domain Match', 'Past Company Match'].includes(r.bestMatch.matchType)
  );

  const headers = [
    'Target Name', 'Target Title', 'Target Company',
    'Best Connection', 'Connected Through', 'Match Type',
    'Connection Strength', 'Intro Request Draft', 'Suggested Next Action'
  ];

  const rows = eligible.map(r => row([
    r.target.rawName, r.target.rawTitle, r.target.rawCompany,
    r.bestMatch?.connection.rawName || '',
    r.bestMatch?.connection.rawConnectedThrough || '',
    r.bestMatch?.matchType || '',
    r.bestMatch?.connectionStrength || '',
    r.bestMatch?.introRequestDraft || '',
    r.bestMatch?.suggestedNextAction || '',
  ]));

  return [row(headers), ...rows].join('\n');
}

export function exportNeedsReview(results: WarmPathResult[]): string {
  const eligible = results.filter(r => r.dataGaps.length > 0 || r.bestMatch?.evidenceConfidence === 'Low');

  const headers = [
    'Target Name', 'Target Company', 'Warm Path Quality',
    'Data Gaps', 'Lookup Status', 'Match Type', 'Evidence Confidence'
  ];

  const rows = eligible.map(r => row([
    r.target.rawName, r.target.rawCompany, r.warmPathQuality,
    r.dataGaps.join('; '), r.lookupStatus,
    r.bestMatch?.matchType || 'N/A',
    r.bestMatch?.evidenceConfidence || 'N/A',
  ]));

  return [row(headers), ...rows].join('\n');
}

export function exportNoKnownPath(results: WarmPathResult[]): string {
  const eligible = results.filter(r => r.warmPathQuality === 'None');

  const headers = [
    'Target Name', 'Target Title', 'Target Company',
    'ICP Fit Score', 'ICP Fit Reason',
    'Fallback Outreach Angle', 'Suggested Subject Line', 'First Call Hook'
  ];

  const rows = eligible.map(r => row([
    r.target.rawName, r.target.rawTitle, r.target.rawCompany,
    r.icpFitScore, r.icpFitReason,
    r.fallbackOutreachAngle || '',
    r.suggestedSubjectLine || '',
    r.suggestedFirstCallHook || '',
  ]));

  return [row(headers), ...rows].join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
