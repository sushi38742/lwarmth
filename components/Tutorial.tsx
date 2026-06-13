'use client';
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ArrowRight, ArrowLeft, Upload, Users, Columns, Zap, Download } from 'lucide-react';

const tutorialSteps = [
  {
    icon: Upload,
    title: 'Upload Target Prospects',
    body: 'Upload a CSV or Excel file of the accounts and contacts you want to reach. Include names, companies, titles, LinkedIn URLs, and emails for best results. The more data you include, the better the matching.',
  },
  {
    icon: Users,
    title: 'Upload Team Connections',
    body: 'Upload your team\'s connection export. This should include who each connection is connected to within your team (the "Connected Through" field is key). LinkedIn exports, CRM exports, or custom lists all work.',
  },
  {
    icon: Columns,
    title: 'Map Your Columns',
    body: 'Tell the tool which column in your file corresponds to which data field. Common column names are auto-detected, so you often just need to verify the mapping looks correct.',
  },
  {
    icon: Zap,
    title: 'Run Warm Path Analysis',
    body: 'The matching engine compares every target against every connection using LinkedIn, company name, domain, and past company data. Results are ranked by connection strength and evidence confidence.',
  },
  {
    icon: Download,
    title: 'Review & Export',
    body: 'Review the results table, filter by warm path quality, and click any row for full detail including draft intro requests. Export to CSV for your team — full results, intro requests only, or targets needing more data.',
  },
];

export default function Tutorial() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];
  const Icon = current.icon;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="flex items-center justify-center gap-2 mb-10">
        {tutorialSteps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setStep(idx)}
            className={`rounded-full transition-all ${
              idx === step ? 'w-6 h-2 bg-[#1A1A1A]' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E3DE] p-8 mb-6 min-h-[220px]">
        <div className="w-10 h-10 bg-[#F7F7F5] rounded-xl flex items-center justify-center mb-5">
          <Icon size={20} className="text-[#1A1A1A]" />
        </div>
        <div className="text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide">
          Step {step + 1} of {tutorialSteps.length}
        </div>
        <h2 className="text-xl font-semibold text-[#0D0D0D] mb-3">{current.title}</h2>
        <p className="text-[#6B7280] text-sm leading-relaxed">{current.body}</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : dispatch({ type: 'SET_STEP', payload: 1 })}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {step < tutorialSteps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Next
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
            className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Start Upload
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
