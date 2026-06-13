'use client';
import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { label: 'Password' },
  { label: 'Welcome' },
  { label: 'Tutorial' },
  { label: 'Upload' },
  { label: 'Mapping' },
  { label: 'Preview' },
  { label: 'Results' },
  { label: 'Detail' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const visibleSteps = steps.slice(1);
  const adjustedCurrent = currentStep - 1;

  if (currentStep === 0) return null;

  return (
    <div className="border-b border-[#E5E3DE] bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#0D0D0D]">Warm Path Finder</span>
          <div className="flex items-center gap-1">
            {visibleSteps.map((step, idx) => {
              const isCompleted = idx < adjustedCurrent;
              const isCurrent = idx === adjustedCurrent;
              const isLast = idx === visibleSteps.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isCompleted ? 'bg-[#1A1A1A] text-white' :
                      isCurrent ? 'bg-[#1A1A1A] text-white ring-2 ring-[#1A1A1A] ring-offset-1' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <Check size={10} /> : idx + 1}
                    </div>
                    <span className={`hidden sm:block text-[9px] mt-0.5 ${isCurrent ? 'text-[#0D0D0D] font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`w-6 h-px mb-3 ${isCompleted ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
