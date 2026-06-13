'use client';
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Eye, EyeOff } from 'lucide-react';

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
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E5E3DE] shadow-sm p-8 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-sm font-bold">WP</span>
          </div>
          <h1 className="text-xl font-semibold text-[#0D0D0D]">Warm Path Finder</h1>
          <p className="text-sm text-[#6B7280] mt-1">Synopsis internal GTM tool</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0D0D0D] mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all pr-10 ${
                  error ? 'border-red-300 focus:border-red-400' : 'border-[#E5E3DE] focus:border-[#1A1A1A]'
                }`}
                placeholder="Enter password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#1A1A1A] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Enter
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Authorized users only. Internal use only.
        </p>
      </div>
    </div>
  );
}
