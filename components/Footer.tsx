
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-6 mt-8">
      <p className="text-slate-500 text-sm">
        TruthLens is an experimental tool. Analyses are AI-generated and may not always be accurate.
      </p>
      <p className="text-slate-600 text-xs mt-1">
        Powered by Google Gemini
      </p>
    </footer>
  );
};