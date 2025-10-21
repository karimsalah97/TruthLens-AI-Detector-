import React from 'react';
import { LogoIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex justify-center items-center gap-3">
        <LogoIcon />
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          TruthLens
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-400">
        Your AI Assistant for Image & Video Analysis
      </p>
    </header>
  );
};