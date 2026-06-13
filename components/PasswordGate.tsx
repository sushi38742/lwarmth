'use client';
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function PasswordGate() {
  const { dispatch } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'synopsis123') {
      dispatch({ type: 'SET_AUTH', payload: true });
      dispatch({ type: 'SET_STEP', payload: 1 });
    } else {
      setError('Incorrect password.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-[#E5E3DE] shadow-sm p-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-[#1A1A1A] rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <span className="text-white text-base font-bold">WP</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#0D0D0D]">Warm Path Finder</h1>
          <p className="text-sm text-[#6B7280] mt-2">Synopsis internal GTM</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#0D0D0D] mb-2">Access password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className={`w-full px-4 py-3 rounded-xl border text-base outline-none transition-all pr-12 ${
                  error ? 'border-red-300 focus:border-red-400' : 'border-[#E5E3DE] focus:border-[#1A1A1A]'
                }`}
                placeholder="Enter password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#1A1A1A] text-white rounded-xl py-3 text-base font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
          >
            Enter <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-8">Authorized users only.</p>
      </div>
    </div>
  );
}
