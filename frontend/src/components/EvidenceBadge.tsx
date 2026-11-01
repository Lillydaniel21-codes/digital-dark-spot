import React from 'react';

interface EvidenceBadgeProps {
  strength: 'Strong' | 'Moderate' | 'Weak' | 'Insufficient evidence' | string;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ strength }) => {
  switch (strength) {
    case 'Strong':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Strong Evidence
        </span>
      );
    case 'Moderate':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
          Moderate Evidence
        </span>
      );
    case 'Weak':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          Weak Evidence
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
          Insufficient Evidence
        </span>
      );
  }
};
