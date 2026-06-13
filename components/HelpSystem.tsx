'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpContextValue {
  active: boolean;
  toggle: () => void;
}

const HelpContext = createContext<HelpContextValue>({ active: false, toggle: () => {} });

export function HelpProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const toggle = () => setActive(v => !v);
  return (
    <HelpContext.Provider value={{ active, toggle }}>
      {children}
      <HelpButton />
    </HelpContext.Provider>
  );
}

export function useHelp() {
  return useContext(HelpContext);
}

function HelpButton() {
  const { active, toggle } = useHelp();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle help"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 ${
        active ? 'bg-[#1A1A1A] text-white ring-4 ring-[#1A1A1A]/20' : 'bg-white text-[#1A1A1A] border border-[#E5E3DE] hover:border-[#1A1A1A]'
      }`}
    >
      {active ? <X size={22} /> : <HelpCircle size={24} />}
    </button>
  );
}

interface HelpHighlightProps {
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpHighlight({ title, body, children, className = '', placement = 'bottom' }: HelpHighlightProps) {
  const { active } = useHelp();
  const bubblePos: Record<string, string> = {
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  };
  return (
    <div className={`relative transition-all duration-300 ${className} ${active ? 'ring-4 ring-amber-300/60 ring-offset-2 ring-offset-[#F7F7F5] rounded-2xl z-20' : ''}`}>
      {children}
      {active && (
        <div className={`absolute z-30 w-72 ${bubblePos[placement]}`}>
          <div className="bg-[#1A1A1A] text-white rounded-xl px-4 py-3 shadow-xl">
            <div className="text-sm font-semibold mb-1">{title}</div>
            <div className="text-xs text-gray-300 leading-relaxed">{body}</div>
          </div>
        </div>
      )}
    </div>
  );
}
