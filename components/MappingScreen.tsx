'use client';
import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { ColumnMapping } from '@/lib/types';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { HelpHighlight } from '@/components/HelpSystem';

type Field = { key: keyof ColumnMapping; label: string; required: boolean; patterns: RegExp[]; hint: string };

const targetFields: Field[] = [
  { key: 'name', label: 'Name', required: true, patterns: [/^(target.?)?name$/i, /^full.?name$/i, /^contact.?name$/i], hint: 'Full name' },
  { key: 'company', label: 'Company', required: true, patterns: [/^(target.?)?company$/i, /^organization$/i, /^account$/i, /^employer$/i], hint: 'Where they work' },
  { key: 'title', label: 'Title', required: false, patterns: [/^(target.?)?title$/i, /^job.?title$/i, /^position$/i, /^role$/i], hint: 'Role at company' },
  { key: 'linkedinUrl', label: 'LinkedIn', required: false, patterns: [/^linkedin/i, /^li.?url$/i, /^profile.?url$/i], hint: 'Profile URL' },
  { key: 'email', label: 'Email', required: false, patterns: [/^email$/i, /^e.?mail$/i], hint: 'Email address' },
  { key: 'domain', label: 'Domain', required: false, patterns: [/^domain$/i, /^company.?domain$/i, /^website$/i, /^url$/i], hint: 'company.com' },
  { key: 'notes', label: 'Notes', required: false, patterns: [/^notes?$/i, /^comments?$/i, /^context$/i], hint: 'Anything else' },
];

const connFields: Field[] = [
  { key: 'name', label: 'Name', required: true, patterns: [/^(connection.?)?name$/i, /^full.?name$/i], hint: 'Connection\'s name' },
  { key: 'company', label: 'Company', required: true, patterns: [/^(connection.?)?company$/i, /^organization$/i, /^employer$/i], hint: 'Current employer' },
  { key: 'title', label: 'Title', required: false, patterns: [/^(connection.?)?title$/i, /^job.?title$/i, /^position$/i, /^role$/i], hint: 'Role' },
  { key: 'linkedinUrl', label: 'LinkedIn', required: false, patterns: [/^linkedin/i, /^li.?url$/i], hint: 'Profile URL' },
  { key: 'connectedThrough', label: 'Connected Through', required: false, patterns: [/^connected.?through$/i, /^via$/i, /^team.?member$/i, /^owner$/i], hint: 'Which teammate knows them' },
  { key: 'pastCompany', label: 'Past Company', required: false, patterns: [/^past.?company$/i, /^previous.?company$/i, /^former.?employer$/i], hint: 'Previous employer' },
  { key: 'email', label: 'Email', required: false, patterns: [/^email$/i], hint: 'Email address' },
];

function autoDetect(headers: string[], patterns: RegExp[]): string {
  for (const h of headers) for (const p of patterns) if (p.test(h.trim())) return h;
  return '';
}

function Section({ title, subtitle, headers, fields, mapping, onChange }: { title: string; subtitle: string; headers: string[]; fields: Field[]; mapping: ColumnMapping; onChange: (m: ColumnMapping) => void }) {
  const mappedCount = fields.filter(f => mapping[f.key]).length;
  return (
    <div className="bg-white border border-[#E5E3DE] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E3DE] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-[#0D0D0D]">{title}</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>
        </div>
        <div className="text-xs font-medium text-[#6B7280] bg-[#F7F7F5] px-3 py-1.5 rounded-full">
          {mappedCount}/{fields.length} mapped
        </div>
      </div>
      <div className="divide-y divide-[#E5E3DE]">
        {fields.map(field => {
          const isMapped = !!mapping[field.key];
          return (
            <div key={field.key} className="px-6 py-4 flex items-center gap-5">
              <div className="w-44 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#0D0D0D]">{field.label}</span>
                  {field.required && <span className="text-red-400 text-sm">*</span>}
                  {isMapped && <Check size={13} className="text-emerald-600" />}
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">{field.hint}</div>
              </div>
              <select
                value={mapping[field.key] || ''}
                onChange={e => onChange({ ...mapping, [field.key]: e.target.value || undefined })}
                className={`flex-1 text-sm border rounded-lg px-3.5 py-2.5 bg-white outline-none transition-colors ${
                  isMapped ? 'border-[#E5E3DE]' : 'border-[#E5E3DE]'
                } focus:border-[#1A1A1A]`}
              >
                <option value="">— not in my file —</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MappingScreen() {
  const { state, dispatch } = useStore();
  const [tMap, setTMap] = useState<ColumnMapping>(state.targetMapping);
  const [cMap, setCMap] = useState<ColumnMapping>(state.connectionMapping);

  useEffect(() => {
    if (Object.keys(state.targetMapping).length === 0 && state.targetHeaders.length > 0) {
      const auto: ColumnMapping = {};
      for (const f of targetFields) { const d = autoDetect(state.targetHeaders, f.patterns); if (d) (auto as Record<string,string>)[f.key] = d; }
      setTMap(auto);
    }
    if (Object.keys(state.connectionMapping).length === 0 && state.connectionHeaders.length > 0) {
      const auto: ColumnMapping = {};
      for (const f of connFields) { const d = autoDetect(state.connectionHeaders, f.patterns); if (d) (auto as Record<string,string>)[f.key] = d; }
      setCMap(auto);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue = (tMap.name || tMap.company) && (cMap.name || cMap.company);

  const handleContinue = () => {
    dispatch({ type: 'SET_TARGET_MAPPING', payload: tMap });
    dispatch({ type: 'SET_CONNECTION_MAPPING', payload: cMap });
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="mb-10">
        <h2 className="text-4xl font-semibold text-[#0D0D0D] mb-3 tracking-tight">Match your columns</h2>
        <p className="text-lg text-[#6B7280]">Tell us which column in your file is which. We've already guessed where possible.</p>
      </div>

      <div className="space-y-6 mb-10">
        <HelpHighlight title="Target columns" body="For each row, pick the column in your CSV that contains that data. Required fields are marked with a red asterisk." placement="top">
          <Section title="Your target file" subtitle={`${state.targetHeaders.length} columns detected`} headers={state.targetHeaders} fields={targetFields} mapping={tMap} onChange={setTMap} />
        </HelpHighlight>
        <HelpHighlight title="Connection columns" body="'Connected Through' is the most important one—it tells us which teammate knows each connection so intro requests can be addressed correctly." placement="top">
          <Section title="Your connections file" subtitle={`${state.connectionHeaders.length} columns detected`} headers={state.connectionHeaders} fields={connFields} mapping={cMap} onChange={setCMap} />
        </HelpHighlight>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D0D0D]">
          <ArrowLeft size={15} /> Back
        </button>
        <button
          disabled={!canContinue}
          onClick={handleContinue}
          className={`flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium transition-colors ${
            canContinue ? 'bg-[#1A1A1A] text-white hover:bg-[#333]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
