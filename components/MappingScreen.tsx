'use client';
import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { ColumnMapping } from '@/lib/types';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';

type MappingField = {
  key: keyof ColumnMapping;
  label: string;
  required: boolean;
  patterns: RegExp[];
  description: string;
};

const targetFields: MappingField[] = [
  { key: 'name', label: 'Full Name', required: true, patterns: [/^(target.?)?name$/i, /^full.?name$/i, /^contact.?name$/i], description: 'Person\'s full name' },
  { key: 'company', label: 'Company', required: true, patterns: [/^(target.?)?company$/i, /^organization$/i, /^account$/i, /^employer$/i], description: 'Company or organization name' },
  { key: 'title', label: 'Job Title', required: false, patterns: [/^(target.?)?title$/i, /^job.?title$/i, /^position$/i, /^role$/i], description: 'Job title or role' },
  { key: 'linkedinUrl', label: 'LinkedIn URL', required: false, patterns: [/^linkedin/i, /^li.?url$/i, /^profile.?url$/i], description: 'LinkedIn profile URL' },
  { key: 'email', label: 'Email Address', required: false, patterns: [/^email$/i, /^e.?mail$/i, /^email.?address$/i], description: 'Email address' },
  { key: 'website', label: 'Company Website', required: false, patterns: [/^website$/i, /^company.?website$/i, /^web$/i, /^url$/i], description: 'Company website URL' },
  { key: 'domain', label: 'Domain', required: false, patterns: [/^domain$/i, /^company.?domain$/i], description: 'Email domain (e.g. company.com)' },
  { key: 'notes', label: 'Notes', required: false, patterns: [/^notes?$/i, /^comments?$/i, /^context$/i, /^description$/i], description: 'Any additional context' },
];

const connectionFields: MappingField[] = [
  { key: 'name', label: 'Full Name', required: true, patterns: [/^(connection.?)?name$/i, /^full.?name$/i, /^contact.?name$/i], description: 'Connection\'s full name' },
  { key: 'company', label: 'Company', required: true, patterns: [/^(connection.?)?company$/i, /^organization$/i, /^employer$/i], description: 'Current company' },
  { key: 'title', label: 'Job Title', required: false, patterns: [/^(connection.?)?title$/i, /^job.?title$/i, /^position$/i, /^role$/i], description: 'Job title or role' },
  { key: 'linkedinUrl', label: 'LinkedIn URL', required: false, patterns: [/^linkedin/i, /^li.?url$/i, /^profile.?url$/i], description: 'LinkedIn profile URL' },
  { key: 'email', label: 'Email Address', required: false, patterns: [/^email$/i, /^e.?mail$/i], description: 'Email address' },
  { key: 'connectedThrough', label: 'Connected Through', required: false, patterns: [/^connected.?through$/i, /^via$/i, /^team.?member$/i, /^owner$/i, /^introducer$/i], description: 'Which team member is connected to this person' },
  { key: 'pastCompany', label: 'Past Company', required: false, patterns: [/^past.?company$/i, /^previous.?company$/i, /^former.?employer$/i, /^prev.?company$/i], description: 'Previous employer (for alumni matching)' },
  { key: 'relationshipStrength', label: 'Relationship Strength', required: false, patterns: [/^relationship.?strength$/i, /^strength$/i, /^connection.?strength$/i], description: 'How strong is the relationship' },
  { key: 'notes', label: 'Notes', required: false, patterns: [/^notes?$/i, /^comments?$/i, /^context$/i], description: 'Any additional context' },
];

function autoDetect(headers: string[], patterns: RegExp[]): string {
  for (const header of headers) {
    for (const pattern of patterns) {
      if (pattern.test(header.trim())) return header;
    }
  }
  return '';
}

interface MappingSectionProps {
  title: string;
  headers: string[];
  fields: MappingField[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
}

function MappingSection({ title, headers, fields, mapping, onChange }: MappingSectionProps) {
  const handleChange = (key: keyof ColumnMapping, value: string) => {
    onChange({ ...mapping, [key]: value || undefined });
  };

  return (
    <div className="bg-white border border-[#E5E3DE] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E3DE] bg-[#F7F7F5]">
        <h3 className="font-semibold text-sm text-[#0D0D0D]">{title}</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">{headers.length} columns detected</p>
      </div>
      <div className="divide-y divide-[#E5E3DE]">
        {fields.map((field) => (
          <div key={field.key} className="px-5 py-3 flex items-center gap-4">
            <div className="w-36 shrink-0">
              <div className="text-sm font-medium text-[#0D0D0D]">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </div>
              <div className="text-xs text-[#6B7280]">{field.description}</div>
            </div>
            <select
              value={mapping[field.key] || ''}
              onChange={e => handleChange(field.key, e.target.value)}
              className="flex-1 text-sm border border-[#E5E3DE] rounded-lg px-3 py-1.5 bg-white outline-none focus:border-[#1A1A1A] transition-colors"
            >
              <option value="">Skip / Not Available</option>
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MappingScreen() {
  const { state, dispatch } = useStore();
  const [targetMapping, setTargetMapping] = useState<ColumnMapping>(state.targetMapping);
  const [connectionMapping, setConnectionMapping] = useState<ColumnMapping>(state.connectionMapping);

  useEffect(() => {
    if (Object.keys(state.targetMapping).length === 0 && state.targetHeaders.length > 0) {
      const auto: ColumnMapping = {};
      for (const field of targetFields) {
        const detected = autoDetect(state.targetHeaders, field.patterns);
        if (detected) (auto as Record<string, string>)[field.key] = detected;
      }
      setTargetMapping(auto);
    }
    if (Object.keys(state.connectionMapping).length === 0 && state.connectionHeaders.length > 0) {
      const auto: ColumnMapping = {};
      for (const field of connectionFields) {
        const detected = autoDetect(state.connectionHeaders, field.patterns);
        if (detected) (auto as Record<string, string>)[field.key] = detected;
      }
      setConnectionMapping(auto);
    }
  }, []);

  const canContinue = (targetMapping.name || targetMapping.company) && (connectionMapping.name || connectionMapping.company);

  const handleContinue = () => {
    dispatch({ type: 'SET_TARGET_MAPPING', payload: targetMapping });
    dispatch({ type: 'SET_CONNECTION_MAPPING', payload: connectionMapping });
    dispatch({ type: 'SET_STEP', payload: 5 });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0D0D0D] mb-2">Map Your Columns</h2>
        <p className="text-[#6B7280] text-sm">We've auto-detected common column names. Review and adjust as needed.</p>
      </div>

      {!connectionMapping.connectedThrough && (
        <div className="mb-5 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <Info size={15} className="mt-0.5 shrink-0" />
          <span>The "Connected Through" column is not mapped — intro drafts will show [Team Member] instead of the actual team member's name. Map this field for best results.</span>
        </div>
      )}

      <div className="space-y-5 mb-8">
        <MappingSection
          title="Target Prospects Mapping"
          headers={state.targetHeaders}
          fields={targetFields}
          mapping={targetMapping}
          onChange={setTargetMapping}
        />
        <MappingSection
          title="Team Connections Mapping"
          headers={state.connectionHeaders}
          fields={connectionFields}
          mapping={connectionMapping}
          onChange={setConnectionMapping}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          disabled={!canContinue}
          onClick={handleContinue}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            canContinue ? 'bg-[#1A1A1A] text-white hover:bg-[#333]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
