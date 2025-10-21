import React from 'react';
import { LogoIcon } from './Icons';

export const Instructions: React.FC = () => {
  return (
    <div className="mt-6 text-center p-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl animate-fade-in">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
      <div className="flex justify-center items-center mb-4">
        <LogoIcon />
      </div>
      <h3 className="text-xl font-semibold text-slate-200">Welcome to TruthLens</h3>
      <p className="mt-2 text-slate-400 max-w-md mx-auto">
        Upload an image or video to begin your analysis. TruthLens will examine the media for signs of AI generation or manipulation and provide a detailed verdict.
      </p>
    </div>
  );
};
