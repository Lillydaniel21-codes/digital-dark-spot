import React from 'react';

interface CategoryBadgeProps {
  status: 'Found' | 'Partially found' | 'Not found in sources reviewed' | 'Conflicting' | 'Requires verification' | string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Found':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          Found
        </span>
      );
    case 'Partially found':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          Partially Found
        </span>
      );
    case 'Conflicting':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
          Conflicting Claims
        </span>
      );
    case 'Requires verification':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
          Requires Verification
        </span>
      );
    case 'Not found in sources reviewed':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-600/40">
          Not found in sources reviewed
        </span>
      );
  }
};
