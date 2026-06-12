export interface RawRow {
  [key: string]: string;
}

export interface ColumnMapping {
  name?: string;
  company?: string;
  title?: string;
  linkedinUrl?: string;
  email?: string;
  website?: string;
  domain?: string;
  notes?: string;
  connectedThrough?: string;
  pastCompany?: string;
  relationshipStrength?: string;
}

export interface NormalizedTarget {
  originalIndex: number;
  rawName: string;
  rawCompany: string;
  rawTitle: string;
  rawLinkedIn: string;
  rawEmail: string;
  rawWebsite: string;
  rawDomain: string;
  rawNotes: string;
  normName: string;
  normCompany: string;
  normDomain: string;
  normLinkedIn: string;
}

export interface NormalizedConnection {
  originalIndex: number;
  rawName: string;
  rawCompany: string;
  rawTitle: string;
  rawLinkedIn: string;
  rawEmail: string;
  rawPastCompany: string;
  rawConnectedThrough: string;
  rawNotes: string;
  normName: string;
  normCompany: string;
  normDomain: string;
  normLinkedIn: string;
  normPastCompany: string;
}

export type WarmPathQuality = 'Strong' | 'Good' | 'Possible' | 'Weak' | 'None' | 'Needs Data';
export type EvidenceConfidence = 'High' | 'Medium' | 'Low' | 'Unknown';
export type MatchType =
  | 'Direct Person Match'
  | 'Same Company Match'
  | 'Same Domain Match'
  | 'Past Company Match'
  | 'No Known Warm Path'
  | 'Needs Data';

export interface WarmPathResult {
  id: string;
  target: NormalizedTarget;
  bestMatch: MatchResult | null;
  allMatches: MatchResult[];
  warmPathQuality: WarmPathQuality;
  dataGaps: string[];
  lookupStatus: string;
  icpFitScore: number;
  icpFitReason: string;
  fallbackOutreachAngle: string | null;
  suggestedSubjectLine: string | null;
  suggestedFirstCallHook: string | null;
}

export interface MatchResult {
  connection: NormalizedConnection;
  matchType: MatchType;
  connectionStrength: number;
  evidenceConfidence: EvidenceConfidence;
  reason: string;
  suggestedNextAction: string;
  introRequestDraft: string | null;
}

export interface AppState {
  isAuthenticated: boolean;
  currentStep: number;
  targetRows: RawRow[];
  connectionRows: RawRow[];
  targetHeaders: string[];
  connectionHeaders: string[];
  targetMapping: ColumnMapping;
  connectionMapping: ColumnMapping;
  results: WarmPathResult[];
  selectedResultId: string | null;
}
