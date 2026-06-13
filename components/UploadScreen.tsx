'use client';
import React, { useRef, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Upload, FileText, ArrowRight, ArrowLeft, X, Target, Users } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RawRow } from '@/lib/types';
import { HelpHighlight } from '@/components/HelpSystem';

function parseFile(file: File): Promise<{ rows: RawRow[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse<RawRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve({ rows: results.data, headers: results.meta.fields || [] }),
        error: reject,
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' });
          resolve({ rows: json, headers: json.length > 0 ? Object.keys(json[0]) : [] });
        } catch (err) { reject(err); }
      };
      reader.readAsBinaryString(file);
    } else { reject(new Error('Unsupported file type')); }
  });
}

interface ZoneProps {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onData: (rows: RawRow[], headers: string[]) => void;
  filename: string | null;
  onClear: () => void;
}

function FileZone({ icon, label, subtitle, onData, filename, onClear }: ZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setError('');
    try {
      const { rows, headers } = await parseFile(file);
      onData(rows, headers);
    } catch { setError('Failed to parse file.'); }
  }, [onData]);

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 bg-[#F7F7F5] rounded-lg flex items-center justify-center">{icon}</div>
        <div>
          <div className="font-semibold text-base text-[#0D0D0D]">{label}</div>
          <div className="text-sm text-[#6B7280]">{subtitle}</div>
        </div>
      </div>

      {filename ? (
        <div className="border-2 border-emerald-200 rounded-2xl p-6 bg-emerald-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-emerald-700" />
            </div>
            <div>
              <div className="text-base font-medium text-[#0D0D0D]">{filename}</div>
              <div className="text-sm text-emerald-700">Ready</div>
            </div>
          </div>
          <button onClick={onClear} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`w-full border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragging ? 'border-[#1A1A1A] bg-white' : 'border-[#E5E3DE] hover:border-gray-400 bg-white/50 hover:bg-white'
          }`}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Upload size={20} className="text-gray-500" />
          </div>
          <div className="text-base font-medium text-[#0D0D0D] mb-1">Click or drag file</div>
          <div className="text-sm text-[#6B7280]">CSV or Excel (.xlsx)</div>
        </button>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

export default function UploadScreen() {
  const { state, dispatch } = useStore();
  const [tFile, setTFile] = useState<string | null>(state.targetHeaders.length > 0 ? 'Previously uploaded' : null);
  const [cFile, setCFile] = useState<string | null>(state.connectionHeaders.length > 0 ? 'Previously uploaded' : null);
  const both = tFile && cFile;

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="mb-12">
        <h2 className="text-4xl font-semibold text-[#0D0D0D] mb-3 tracking-tight">Upload two files</h2>
        <p className="text-lg text-[#6B7280]">Your targets and your team's connections. We'll match them.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <HelpHighlight title="Target prospects" body="The accounts and people you want to reach. Include LinkedIn URLs, emails, and companies for best matching." placement="bottom">
          <FileZone
            icon={<Target size={18} className="text-[#1A1A1A]" />}
            label="Target prospects"
            subtitle="Who you want to reach"
            filename={tFile}
            onClear={() => { setTFile(null); dispatch({ type: 'SET_TARGET_DATA', payload: { rows: [], headers: [] } }); }}
            onData={(rows, headers) => { dispatch({ type: 'SET_TARGET_DATA', payload: { rows, headers } }); setTFile(`${rows.length} rows • ${headers.length} columns`); }}
          />
        </HelpHighlight>
        <HelpHighlight title="Team connections" body="Your team's network export. The 'Connected Through' column tells us which team member knows each contact." placement="bottom">
          <FileZone
            icon={<Users size={18} className="text-[#1A1A1A]" />}
            label="Team connections"
            subtitle="Your network"
            filename={cFile}
            onClear={() => { setCFile(null); dispatch({ type: 'SET_CONNECTION_DATA', payload: { rows: [], headers: [] } }); }}
            onData={(rows, headers) => { dispatch({ type: 'SET_CONNECTION_DATA', payload: { rows, headers } }); setCFile(`${rows.length} rows • ${headers.length} columns`); }}
          />
        </HelpHighlight>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D0D0D]">
          <ArrowLeft size={15} /> Back
        </button>
        <button
          disabled={!both}
          onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
          className={`flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium transition-colors ${
            both ? 'bg-[#1A1A1A] text-white hover:bg-[#333]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
