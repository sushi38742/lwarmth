'use client';
import React from 'react';

type BadgeVariant = 'strong' | 'good' | 'possible' | 'weak' | 'none' | 'needsdata' | 'high' | 'medium' | 'low' | 'unknown' | 'default';

const variantClasses: Record<BadgeVariant, string> = {
  strong: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  good: 'bg-blue-100 text-blue-800 border border-blue-200',
  possible: 'bg-amber-100 text-amber-800 border border-amber-200',
  weak: 'bg-gray-100 text-gray-600 border border-gray-200',
  none: 'bg-red-100 text-red-800 border border-red-200',
  needsdata: 'bg-purple-100 text-purple-800 border border-purple-200',
  high: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border border-amber-200',
  low: 'bg-red-100 text-red-800 border border-red-200',
  unknown: 'bg-gray-100 text-gray-600 border border-gray-200',
  default: 'bg-gray-100 text-gray-700 border border-gray-200',
};

export function qualityToVariant(quality: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Strong': 'strong',
    'Good': 'good',
    'Possible': 'possible',
    'Weak': 'weak',
    'None': 'none',
    'Needs Data': 'needsdata',
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low',
    'Unknown': 'unknown',
  };
  return map[quality] || 'default';
}

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
