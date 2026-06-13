'use client';
import React from 'react';
import { useStore } from '@/lib/store';

const stepLabels = ['', 'Welcome', 'Upload', 'Map', 'Preview', 'Results', 'Detail'];

export default function TopBar({ currentStep }: { currentStep: number }) {
  const { dispatch } = useStore();
  if (currentStep === 0) return null;
  const visible = [1, 2, 3, 4, 5];
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E3DE] bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">WP</span>
          </div>
          <span className="font-semibold text-[#0D0D0D] text-base">Warm Path Finder</span>
        </button>
        <div className="hidden md:flex items-center gap-1.5">
          {visible.map(s => {
            const isActive = currentStep === s;
            const isDone = currentStep > s;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive ? 'bg-[#1A1A1A] text-white' :
                  isDone ? 'text-[#0D0D0D]' : 'text-gray-400'
                }`}>
                  {stepLabels[s]}
                </div>
                {s < 5 && <div className={`w-4 h-px ${isDone ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
