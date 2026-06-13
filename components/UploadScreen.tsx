'use client';
import React, { useRef, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Upload, FileText, ArrowRight, ArrowLeft, X } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RawRow } from '@/lib/types';

interface FileZoneProps {
  label: string;
  subtitle: string;
  onData: (rows: RawRow[], headers: string[]) => void;
  filename: string | null;
  onClear: () => void;
}

function parseFile(file: File): Promise<{ rows: RawRow[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse<RawRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          resolve({ rows: results.data, headers });
        },
        error: reject,
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' });
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          resolve({ rows: json, headers });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
}

function FileZone({ label, subtitle, onData, filename, onClear }: FileZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setError('');
    try {
      const { rows, headers } = await parseFile(file);
      onData(rows, headers);
    } catch {
      setError('Failed to parse file. Please check the format.');
    }
  }, [onData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="flex-1">
      <div className="font-medium text-sm text-[#0D0D0D] mb-1">{label}</div>
      <div className="text-xs text-[#6B7280] mb-3">{subtitle}</div>

      {filename ? (
        <div className="border border-[#E5E3DE] rounded-xl p-4 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText size={15} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#0D0D0D]">{filename}</div>
              <div className="text-xs text-[#6B7280]">Ready to map</div>
            </div>
          </div>
          <button onClick={onClear} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragging ? 'border-[#1A1A1A] bg-gray-50' : 'border-[#E5E3DE] hover:border-gray-300 hover:bg-white'
          }`}
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Upload size={18} className="text-gray-500" />
          </div>
          <div className="text-sm font-medium text-[#0D0D0D] mb-1">Click to upload or drag & drop</div>
          <div className="text-xs text-[#6B7280]">CSV or Excel (.xlsx) files</div>
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

export default function UploadScreen() {
  const { state, dispatch } = useStore();
  const [targetFilename, setTargetFilename] = useState<string | null>(
    state.targetHeaders.length > 0 ? 'Previously uploaded' : null
  );
  const [connectionFilename, setConnectionFilename] = useState<string | null>(
    state.connectionHeaders.length > 0 ? 'Previously uploaded' : null
  );

  const bothUploaded = targetFilename && connectionFilename;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0D0D0D] mb-2">Upload Your Files</h2>
        <p className="text-[#6B7280] text-sm">Upload both files to continue. You'll map the columns in the next step.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 mb-8">
        <FileZone
          label="Target Prospects"
          subtitle="The accounts and contacts you want to reach"
          filename={targetFilename}
          onClear={() => {
            setTargetFilename(null);
            dispatch({ type: 'SET_TARGET_DATA', payload: { rows: [], headers: [] } });
          }}
          onData={(rows, headers) => {
            dispatch({ type: 'SET_TARGET_DATA', payload: { rows, headers } });
            setTargetFilename(`${rows.length} rows, ${headers.length} columns`);
          }}
        />
        <FileZone
          label="Team Connections"
          subtitle="Your team's network connections export"
          filename={connectionFilename}
          onClear={() => {
            setConnectionFilename(null);
            dispatch({ type: 'SET_CONNECTION_DATA', payload: { rows: [], headers: [] } });
          }}
          onData={(rows, headers) => {
            dispatch({ type: 'SET_CONNECTION_DATA', payload: { rows, headers } });
            setConnectionFilename(`${rows.length} rows, ${headers.length} columns`);
          }}
        />
      </div>

      {!bothUploaded && (
        <div className="text-xs text-[#6B7280] bg-white border border-[#E5E3DE] rounded-lg px-4 py-3 mb-6">
          Both files are required to run analysis. Upload your target prospects and team connections to continue.
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          disabled={!bothUploaded}
          onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            bothUploaded
              ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
