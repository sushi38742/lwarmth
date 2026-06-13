'use client';
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ArrowLeft, Zap, AlertCircle } from 'lucide-react';
import { normalizeTarget, normalizeConnection } from '@/lib/normalization';
import { runMatching } from '@/lib/matching';
import { RawRow, ColumnMapping } from '@/lib/types';

function PreviewTable({ rows, mapping, label }: { rows: RawRow[]; mapping: ColumnMapping; label: string }) {
  const mappedFields = Object.entries(mapping).filter(([, v]) => v);
  if (mappedFields.length === 0) return null;
  const preview = rows.slice(0, 5);

  return (
    <div className="flex-1 min-w-0">
      <div className="font-medium text-sm text-[#0D0D0D] mb-3">{label} — first 5 rows</div>
      <div className="overflow-x-auto rounded-xl border border-[#E5E3DE] scrollbar-thin">
        <table className="text-xs w-full">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E5E3DE]">
              {mappedFields.map(([key, col]) => (
                <th key={key} className="px-3 py-2.5 text-left font-medium text-[#6B7280] whitespace-nowrap">
                  {col as string}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DE]">
            {preview.map((row, idx) => (
              <tr key={idx} className="bg-white hover:bg-[#F7F7F5] transition-colors">
                {mappedFields.map(([key, col]) => (
                  <td key={key} className="px-3 py-2 text-[#0D0D0D] max-w-[180px] truncate">
                    {row[col as string] || <span className="text-gray-300">—</span>}
                  </td>
                ))}
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

  const warnings: string[] = [];
  if (!state.connectionMapping.connectedThrough) {
    warnings.push('"Connected Through" column not mapped — intro drafts will show [Team Member]');
  }
  if (!state.targetMapping.linkedinUrl) {
    warnings.push('Target LinkedIn URL not mapped — direct person matching by LinkedIn will be skipped');
  }
  if (!state.connectionMapping.pastCompany) {
    warnings.push('"Past Company" not mapped — alumni/past-company matching will be skipped');
  }

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const targets = state.targetRows.map((row, idx) =>
      normalizeTarget(row, state.targetMapping, idx)
    );
    const connections = state.connectionRows.map((row, idx) =>
      normalizeConnection(row, state.connectionMapping, idx)
    );

    const results = runMatching(targets, connections);
    dispatch({ type: 'SET_RESULTS', payload: results });
    dispatch({ type: 'SET_STEP', payload: 6 });
    setAnalyzing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0D0D0D] mb-2">Preview Your Data</h2>
        <p className="text-[#6B7280] text-sm">
          Review the mapped data below. {state.targetRows.length} targets and {state.connectionRows.length} connections loaded.
        </p>
      </div>

      {warnings.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-5 mb-8">
        <PreviewTable
          rows={state.targetRows}
          mapping={state.targetMapping}
          label="Target Prospects"
        />
        <PreviewTable
          rows={state.connectionRows}
          mapping={state.connectionMapping}
          label="Team Connections"
        />
      </div>

      <div className="border-t border-[#E5E3DE] pt-6 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-60"
        >
          {analyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap size={14} />
              Run Analysis →
            </>
          )}
        </button>
      </div>
    </div>
  );
}
