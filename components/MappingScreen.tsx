'use client';
import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { ColumnMapping } from '@/lib/types';
import { ArrowLeft, ArrowRight, Check, Sparkles, Pencil, X } from 'lucide-react';
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
  { key: 'name', label: 'Name', required: true, patterns: [/^(connection.?)?name$/i, /^full.?name$/i], hint: 'Connection name' },
  { key: 'company', label: 'Company', required: true, patterns: [/^(connection.?)?company$/i, /^organization$/i, /^employer$/i], hint: 'Current employer' },
  { key: 'title', label: 'Title', required: false, patterns: [/^(connection.?)?title$/i, /^job.?title$/i, /^position$/i, /^role$/i], hint: 'Role' },
  { key: 'linkedinUrl', label: 'LinkedIn', required: false, patterns: [/^linkedin/i, /^li.?url$/i], hint: 'Profile URL' },
  { key: 'connectedThrough', label: 'Connected Through', required: false, patterns: [/^connected.?through$/i, /^via$/i, /^team.?member$/i, /^owner$/i], hint: 'Which teammate knows them' },
  { key: 'pastCompany', label: 'Past Company', required: false, patterns: [/^past.?company$/i, /^previous.?company$/i, /^former.?employer$/i], hint: 'Previous employer' },
  { key: 'email', label: 'Email', required: false, patterns: [/^email$/i], hint: 'Email address' },
];

function autoDetectLocal(headers: string[], patterns: RegExp[]): string {
  for (const h of headers) for (const p of patterns) if (p.test(h.trim())) return h;
  return '';
}

function localFallback(headers: string[], fields: Field[]): ColumnMapping {
  const m: ColumnMapping = {};
  for (const f of fields) {
    const d = autoDetectLocal(headers, f.patterns);
    if (d) (m as Record<string, string>)[f.key] = d;
  }
  return m;
}

async function aiMap(kind: 'target' | 'connection', headers: string[], sampleRows: Record<string, string>[]): Promise<{ mapping: ColumnMapping; reasoning: string }> {
  try {
    const res = await fetch('/api/automap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, headers, sampleRows }),
    });
    if (!res.ok) throw new Error('automap failed');
    const data = await res.json();
    return { mapping: data.mapping || {}, reasoning: data.reasoning || '' };
  } catch {
    return { mapping: localFallback(headers, kind === 'target' ? targetFields : connFields), reasoning: 'AI unavailable — used local pattern matching' };
  }
}

function ConfirmRow({ field, value, headers, onChange, editing, onEdit }: { field: Field; value: string | undefined; headers: string[]; onChange: (v: string) => void; editing: boolean; onEdit: () => void }) {
  const mapped = !!value;
  if (editing) {
    return (
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="w-44 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-[#0D0D0D]">{field.label}</span>
            {field.required && <span className="text-red-400 text-sm">*</span>}
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">{field.hint}</div>
        </div>
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          autoFocus
          className="flex-1 text-sm border border-[#1A1A1A] rounded-lg px-3.5 py-2.5 bg-white outline-none"
        >
          <option value="">— not in file —</option>
          {headers.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 px-6 py-4 group">
      <div className="w-44 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[#0D0D0D]">{field.label}</span>
          {field.required && <span className="text-red-400 text-sm">*</span>}
        </div>
        <div className="text-xs text-[#6B7280] mt-0.5">{field.hint}</div>
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {mapped ? (
          <>
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span className="text-sm font-medium text-[#0D0D0D] truncate">{value}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400 italic">not mapped</span>
        )}
      </div>
      <button onClick={onEdit} className="text-xs text-[#6B7280] hover:text-[#0D0D0D] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <Pencil size={11} /> change
      </button>
    </div>
  );
}

function ConfirmCard({ title, subtitle, fields, mapping, headers, onChange }: { title: string; subtitle: string; fields: Field[]; mapping: ColumnMapping; headers: string[]; onChange: (m: ColumnMapping) => void }) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const mappedCount = fields.filter(f => mapping[f.key]).length;
  return (
    <div className="bg-white border border-[#E5E3DE] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E3DE] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-[#0D0D0D]">{title}</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>
        </div>
        <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          {mappedCount}/{fields.length} mapped
        </div>
      </div>
      <div className="divide-y divide-[#E5E3DE]">
        {fields.map(f => (
          <ConfirmRow
            key={f.key}
            field={f}
            value={mapping[f.key]}
            headers={headers}
            editing={editingKey === f.key}
            onEdit={() => setEditingKey(editingKey === f.key ? null : f.key)}
            onChange={v => { onChange({ ...mapping, [f.key]: v || undefined }); setEditingKey(null); }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MappingScreen() {
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(true);
  const [tMap, setTMap] = useState<ColumnMapping>(state.targetMapping);
  const [cMap, setCMap] = useState<ColumnMapping>(state.connectionMapping);
  const [tReason, setTReason] = useState('');
  const [cReason, setCReason] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const needT = Object.keys(state.targetMapping).length === 0 && state.targetHeaders.length > 0;
      const needC = Object.keys(state.connectionMapping).length === 0 && state.connectionHeaders.length > 0;
      if (!needT && !needC) { setLoading(false); return; }
      const [tResult, cResult] = await Promise.all([
        needT ? aiMap('target', state.targetHeaders, state.targetRows.slice(0, 3)) : Promise.resolve({ mapping: state.targetMapping, reasoning: '' }),
        needC ? aiMap('connection', state.connectionHeaders, state.connectionRows.slice(0, 3)) : Promise.resolve({ mapping: state.connectionMapping, reasoning: '' }),
      ]);
      if (cancelled) return;
      setTMap(tResult.mapping);
      setCMap(cResult.mapping);
      setTReason(tResult.reasoning);
      setCReason(cResult.reasoning);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue = (tMap.name || tMap.company) && (cMap.name || cMap.company);
  const handleContinue = () => {
    dispatch({ type: 'SET_TARGET_MAPPING', payload: tMap });
    dispatch({ type: 'SET_CONNECTION_MAPPING', payload: cMap });
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1A1A1A] mb-6 relative">
          <Sparkles size={26} className="text-white animate-pulse" />
        </div>
        <h2 className="text-3xl font-semibold text-[#0D0D0D] mb-3 tracking-tight">Reading your files…</h2>
        <p className="text-base text-[#6B7280]">AI is figuring out which column is which. Takes a few seconds.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#1A1A1A] bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-5">
          <Sparkles size={12} /> AI-mapped
        </div>
        <h2 className="text-4xl font-semibold text-[#0D0D0D] mb-3 tracking-tight">Does this look right?</h2>
        <p className="text-lg text-[#6B7280]">AI matched your columns to our fields. Hover any row to change it.</p>
      </div>

      <div className="space-y-6 mb-10">
        <HelpHighlight title="Target columns" body="AI inferred these from your headers and sample data. Hover a row and click 'change' to override." placement="top">
          <ConfirmCard title="Your target file" subtitle={tReason || `${state.targetHeaders.length} columns detected`} fields={targetFields} mapping={tMap} headers={state.targetHeaders} onChange={setTMap} />
        </HelpHighlight>
        <HelpHighlight title="Connection columns" body="'Connected Through' is the most important field — it tells us which teammate knows each connection so intros can be addressed correctly." placement="top">
          <ConfirmCard title="Your connections file" subtitle={cReason || `${state.connectionHeaders.length} columns detected`} fields={connFields} mapping={cMap} headers={state.connectionHeaders} onChange={setCMap} />
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
          Looks right <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
