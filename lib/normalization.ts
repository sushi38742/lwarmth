import { RawRow, ColumnMapping, NormalizedTarget, NormalizedConnection } from './types';

export function normalizeLinkedIn(url: string): string {
  if (!url) return '';
  let s = url.trim().toLowerCase();
  const match = s.match(/linkedin\.com\/in\/([^/?#]+)/);
  if (match) return match[1].replace(/\/$/, '');
  if (!s.includes('linkedin.com') && !s.includes('/')) return s;
  return s.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/[/?#].*$/, '').replace(/\/+$/, '');
}

export function normalizeCompany(name: string): string {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\b(inc|llc|corp|corporation|co|company|ltd|limited|group|holdings|ventures|technologies|solutions|services|consulting)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeDomain(input: string): string {
  if (!input) return '';
  return input.toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .trim();
}

export function extractDomainFromEmail(email: string): string {
  if (!email || !email.includes('@')) return '';
  return normalizeDomain(email.split('@')[1]);
}

export function extractDomainFromWebsite(website: string): string {
  return normalizeDomain(website);
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function detectSeniority(title: string): 'executive' | 'senior' | 'mid' | 'junior' | 'unknown' {
  const t = title.toLowerCase();
  if (/\b(ceo|cfo|coo|cro|cto|cio|president|founder|co-founder|cofounder|managing director|operating partner|partner|principal)\b/.test(t)) return 'executive';
  if (/\b(vp|svp|evp|vice president|head of|director|senior director)\b/.test(t)) return 'senior';
  if (/\b(manager|lead|specialist|consultant)\b/.test(t)) return 'mid';
  if (/\b(associate|analyst|coordinator|assistant|intern)\b/.test(t)) return 'junior';
  return 'unknown';
}

export function normalizeTarget(row: RawRow, mapping: ColumnMapping, index: number): NormalizedTarget {
  const get = (field: keyof ColumnMapping) => (mapping[field] ? (row[mapping[field]!] || '') : '');

  const rawName = get('name');
  const rawCompany = get('company');
  const rawEmail = get('email');
  const rawWebsite = get('website');
  const rawLinkedIn = get('linkedinUrl');

  const domainFromEmail = extractDomainFromEmail(rawEmail);
  const domainFromWebsite = extractDomainFromWebsite(rawWebsite);
  const rawDomain = get('domain') || domainFromEmail || domainFromWebsite;

  return {
    originalIndex: index,
    rawName,
    rawCompany,
    rawTitle: get('title'),
    rawLinkedIn,
    rawEmail,
    rawWebsite,
    rawDomain,
    rawNotes: get('notes'),
    normName: normalizeName(rawName),
    normCompany: normalizeCompany(rawCompany),
    normDomain: normalizeDomain(rawDomain),
    normLinkedIn: normalizeLinkedIn(rawLinkedIn),
  };
}

export function normalizeConnection(row: RawRow, mapping: ColumnMapping, index: number): NormalizedConnection {
  const get = (field: keyof ColumnMapping) => (mapping[field] ? (row[mapping[field]!] || '') : '');

  const rawName = get('name');
  const rawCompany = get('company');
  const rawEmail = get('email');
  const rawWebsite = get('website');
  const rawLinkedIn = get('linkedinUrl');
  const rawPastCompany = get('pastCompany');

  const domainFromEmail = extractDomainFromEmail(rawEmail);
  const domainFromWebsite = extractDomainFromWebsite(rawWebsite);
  const rawDomain = get('domain') || domainFromEmail || domainFromWebsite;

  return {
    originalIndex: index,
    rawName,
    rawCompany,
    rawTitle: get('title'),
    rawLinkedIn,
    rawEmail,
    rawPastCompany,
    rawConnectedThrough: get('connectedThrough'),
    rawNotes: get('notes'),
    normName: normalizeName(rawName),
    normCompany: normalizeCompany(rawCompany),
    normDomain: normalizeDomain(rawDomain),
    normLinkedIn: normalizeLinkedIn(rawLinkedIn),
    normPastCompany: normalizeCompany(rawPastCompany),
  };
}
