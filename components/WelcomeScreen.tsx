'use client';
import React from 'react';
import { useStore } from '@/lib/store';
import { ArrowRight, Download } from 'lucide-react';

const TARGET_TEMPLATE = `Target Name,Target Title,Target Company,Target LinkedIn URL,Target Email,Company Website,Company Domain,Industry,Notes
Julie Smith,CFO,ABC Health,linkedin.com/in/juliesmith,julie@abchealth.com,abchealth.com,abchealth.com,Healthcare,PE-backed healthcare operator
Mark Lee,COO,Northstar Logistics,linkedin.com/in/marklee,mark@northstar.com,northstar.com,northstar.com,Logistics,Operations-heavy logistics company
Dana Patel,Managing Director,Summit Capital,linkedin.com/in/danapatel,dana@summitcapital.com,summitcapital.com,summitcapital.com,Private Equity,PE operating partner
Alex Rivera,VP Finance,,alex@unknownco.com,,,Finance,Missing company data test case`;

const CONNECTION_TEMPLATE = `Connection Name,Connection Title,Connection Company,Connection LinkedIn URL,Connected Through,Email,Company Website,Company Domain,Past Company,Relationship Strength,Notes
Sarah Jones,VP Sales,ABC Health,linkedin.com/in/sarahjones,Justin,sarah@abchealth.com,abchealth.com,abchealth.com,,Strong,Justin LinkedIn connection
Emily Brown,Former Director,Consulting Co,linkedin.com/in/emilybrown,Kris,emily@consultingco.com,,,Northstar Logistics,Medium,Former Northstar employee
David Cohen,Operating Partner,Summit Capital,linkedin.com/in/davidcohen,Daniel,david@summitcapital.com,summitcapital.com,summitcapital.com,,Strong,PE relationship
Julie Smith,CFO,ABC Health,linkedin.com/in/juliesmith,Justin,julie@abchealth.com,abchealth.com,abchealth.com,,Strong,Direct connection test`;

function downloadTemplate(content: string, filename: string) {
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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-[#0D0D0D] mb-3">
          Welcome to Warm Path Finder
        </h1>
        <p className="text-[#6B7280] text-base leading-relaxed mb-4">
          Warm Path Finder compares your target prospect list against your team's connection data to surface evidence-based warm intro paths. Upload two CSVs, map the columns, and the tool will identify direct connections, same-company contacts, domain matches, and past-company relationships — ranked by connection strength.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <strong>Important:</strong> This tool does not prove personal relationships. It identifies evidence-based possible paths. Same-company matches require human confirmation before requesting introductions.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <button
          onClick={() => downloadTemplate(TARGET_TEMPLATE, 'target-prospects-template.csv')}
          className="flex items-center gap-2 px-4 py-3 border border-[#E5E3DE] rounded-lg text-sm text-[#0D0D0D] hover:bg-white hover:border-gray-300 transition-all"
        >
          <Download size={15} className="text-gray-500" />
          <span className="font-medium">Target Prospects Template</span>
        </button>
        <button
          onClick={() => downloadTemplate(CONNECTION_TEMPLATE, 'team-connections-template.csv')}
          className="flex items-center gap-2 px-4 py-3 border border-[#E5E3DE] rounded-lg text-sm text-[#0D0D0D] hover:bg-white hover:border-gray-300 transition-all"
        >
          <Download size={15} className="text-gray-500" />
          <span className="font-medium">Team Connections Template</span>
        </button>
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors"
      >
        Start Analysis
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
