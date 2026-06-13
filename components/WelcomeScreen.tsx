'use client';
import React from 'react';
import { useStore } from '@/lib/store';
import { ArrowRight, Download, Sparkles } from 'lucide-react';

const TARGET_TEMPLATE = `Target Name,Target Title,Target Company,Target LinkedIn URL,Target Email,Company Website,Company Domain,Industry,Notes
Julie Smith,CFO,ABC Health,linkedin.com/in/juliesmith,julie@abchealth.com,abchealth.com,abchealth.com,Healthcare,PE-backed healthcare operator
Mark Lee,COO,Northstar Logistics,linkedin.com/in/marklee,mark@northstar.com,northstar.com,northstar.com,Logistics,Operations-heavy logistics company
Dana Patel,Managing Director,Summit Capital,linkedin.com/in/danapatel,dana@summitcapital.com,summitcapital.com,summitcapital.com,Private Equity,PE operating partner`;

const CONNECTION_TEMPLATE = `Connection Name,Connection Title,Connection Company,Connection LinkedIn URL,Connected Through,Email,Company Website,Company Domain,Past Company,Relationship Strength,Notes
Sarah Jones,VP Sales,ABC Health,linkedin.com/in/sarahjones,Justin,sarah@abchealth.com,abchealth.com,abchealth.com,,Strong,Justin LinkedIn connection
Emily Brown,Former Director,Consulting Co,linkedin.com/in/emilybrown,Kris,emily@consultingco.com,,,Northstar Logistics,Medium,Former Northstar employee
David Cohen,Operating Partner,Summit Capital,linkedin.com/in/davidcohen,Daniel,david@summitcapital.com,summitcapital.com,summitcapital.com,,Strong,PE relationship`;

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function WelcomeScreen() {
  const { dispatch } = useStore();
  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">
      <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280] mb-6">
        <Sparkles size={14} className="text-[#1A1A1A]" />
        SYNOPSIS INTERNAL GTM
      </div>
      <h1 className="text-5xl sm:text-6xl font-semibold text-[#0D0D0D] tracking-tight leading-[1.05] mb-6">
        Find warm paths<br />into every account.
      </h1>
      <p className="text-xl text-[#6B7280] leading-relaxed mb-10 max-w-2xl">
        Upload your target list and your team's connections. We surface evidence-based intro paths—ranked, scored, ready to action.
      </p>

      <button
        onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-7 py-4 rounded-xl text-base font-medium hover:bg-[#333] transition-colors mb-12"
      >
        Start analysis
        <ArrowRight size={18} />
      </button>

      <div className="border-t border-[#E5E3DE] pt-8">
        <div className="text-sm font-medium text-[#0D0D0D] mb-4">Need example data?</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => download(TARGET_TEMPLATE, 'target-prospects-template.csv')}
            className="flex items-center justify-between px-5 py-4 bg-white border border-[#E5E3DE] rounded-xl hover:border-[#1A1A1A] transition-colors text-left"
          >
            <div>
              <div className="text-sm font-medium text-[#0D0D0D]">Targets template</div>
              <div className="text-xs text-[#6B7280] mt-0.5">CSV with example prospects</div>
            </div>
            <Download size={16} className="text-[#6B7280]" />
          </button>
          <button
            onClick={() => download(CONNECTION_TEMPLATE, 'team-connections-template.csv')}
            className="flex items-center justify-between px-5 py-4 bg-white border border-[#E5E3DE] rounded-xl hover:border-[#1A1A1A] transition-colors text-left"
          >
            <div>
              <div className="text-sm font-medium text-[#0D0D0D]">Connections template</div>
              <div className="text-xs text-[#6B7280] mt-0.5">CSV with example connections</div>
            </div>
            <Download size={16} className="text-[#6B7280]" />
          </button>
        </div>
      </div>

      <div className="mt-10 text-xs text-[#9CA3AF] leading-relaxed max-w-xl">
        This tool identifies evidence-based possible paths—it does not prove personal relationships. Same-company matches require human confirmation.
      </div>
    </div>
  );
}
