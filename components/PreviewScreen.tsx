'use client';
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ArrowLeft, Zap } from 'lucide-react';
import { normalizeTarget, normalizeConnection } from '@/lib/normalization';
import { runMatching } from '@/lib/matching';
import { RawRow, ColumnMapping } from '@/lib/types';
import { HelpHighlight } from '@/components/HelpSystem';

function PreviewTable({ rows, mapping, label }: { rows: RawRow[]; mapping: ColumnMapping; label: string }) {
  const mapped = Object.entries(mapping).filter(([, v]) => v);
  if (mapped.length === 0) return null;
  const preview = rows.slice(0, 4);
  return (
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-base text-[#0D0D0D] mb-3">{label}</div>
      <div className="overflow-x-auto rounded-2xl border border-[#E5E3DE] bg-white scrollbar-thin">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E5E3DE]">
              {mapped.map(([k, c]) => <th key={k} className="px-4 py-3 text-left font-medium text-[#6B7280] text-xs whitespace-nowrap">{c as string}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DE]">
            {preview.map((r, i) => (
              <tr key={i}>
                {mapped.map(([k, c]) => <td key={k} className="px-4 py-3 text-[#0D0D0D] max-w-[200px] truncate">{r[c as string] || <span className="text-gray-300">—</span>}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PreviewScreen() {
  const { state, dispatch } = useStore();
  const [analyzing, setAnalyzing] = useState(false);

  const handleRun = async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 800));
    const targets = state.targetRows.map((row, i) => normalizeTarget(row, state.targetMapping, i));
    const conns = state.connectionRows.map((row, i) => normalizeConnection(row, state.connectionMapping, i));
    const results = runMatching(targets, conns);
    dispatch({ type: 'SET_RESULTS', payload: results });
    dispatch({ type: 'SET_STEP', payload: 5 });
    setAnalyzing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="mb-10">
        <h2 className="text-4xl font-semibold text-[#0D0D0D] mb-3 tracking-tight">Looks right?</h2>
        <p className="text-lg text-[#6B7280]">{state.targetRows.length} targets • {state.connectionRows.length} connections loaded.</p>
      </div>

      <HelpHighlight title="Quick check" body="Skim these first rows. If columns look wrong, go back and remap. Once you hit run, we score every target against every connection." placement="top">
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <PreviewTable rows={state.targetRows} mapping={state.targetMapping} label="Targets" />
          <PreviewTable rows={state.connectionRows} mapping={state.connectionMapping} label="Connections" />
        </div>
      </HelpHighlight>

      <div className="border-t border-[#E5E3DE] pt-8 flex items-center justify-between">
        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D0D0D]">
          <ArrowLeft size={15} /> Back
        </button>
        <button onClick={handleRun} disabled={analyzing} className="flex items-center gap-2.5 bg-[#1A1A1A] text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-[#333] transition-colors disabled:opacity-60">
          {analyzing ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing…</>
          ) : (
            <><Zap size={17} /> Run analysis</>
          )}
        </button>
      </div>
    </div>
  );
}
