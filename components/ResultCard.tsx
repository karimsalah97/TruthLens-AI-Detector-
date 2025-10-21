import React, { useState } from 'react';
import type { AnalysisResult, Verdict } from '../types';
import { CheckCircleIcon, RobotIcon, ScissorsIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon } from './Icons';


interface ResultCardProps {
  result: AnalysisResult;
}

const getVerdictStyles = (verdict: Verdict) => {
  switch (verdict) {
    case 'Likely Real':
      return {
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30',
        Icon: <CheckCircleIcon />,
      };
    case 'Possibly AI-Generated':
      return {
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/30',
        Icon: <MagnifyingGlassIcon />,
      };
    case 'Clearly AI-Generated':
      return {
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        Icon: <RobotIcon />,
      };
    case 'Manipulated':
      return {
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
        Icon: <ScissorsIcon />,
      };
    case 'Uncertain':
    default:
      return {
        bgColor: 'bg-slate-600/20',
        textColor: 'text-slate-400',
        borderColor: 'border-slate-600/30',
        Icon: <QuestionMarkCircleIcon />,
      };
  }
};

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const styles = getVerdictStyles(result.verdict);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedback = (feedback: string) => {
    console.log('User feedback:', feedback);
    setFeedbackSubmitted(true);
  };

  return (
    <div className={`bg-slate-800/50 p-6 rounded-2xl shadow-lg border ${styles.borderColor} backdrop-blur-sm`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Verdict</h3>
            <div className={`flex items-center gap-2 px-4 py-2 text-lg font-bold rounded-lg ${styles.bgColor} ${styles.textColor}`}>
              {styles.Icon}
              <span>{result.verdict}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Confidence</h3>
            <span
              className="px-4 py-1.5 text-base font-semibold rounded-full bg-slate-700/50 text-slate-300"
            >
              {result.confidence}
            </span>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">Description</h3>
          <p className="text-slate-300 whitespace-pre-wrap mb-4">{result.description}</p>

          <h3 className="text-lg font-semibold text-cyan-300 mb-2">Reasoning</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{result.reasoning}</p>
          
          <h3 className="text-lg font-semibold text-cyan-300 mt-4 mb-2">AI Reflection</h3>
          <p className="text-slate-400 italic text-sm whitespace-pre-wrap">{result.reflection}</p>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              AI judgment only — verify with trusted forensic tools.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700 text-center">
        {feedbackSubmitted ? (
          <p className="text-green-400 font-semibold">Thank you for your feedback!</p>
        ) : (
          <>
            <p className="text-slate-400 mb-3 text-sm">Was this analysis correct?</p>
            <div className="flex justify-center items-center gap-3">
              <button onClick={() => handleFeedback('Real')} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all text-sm font-medium">✅ Real</button>
              <button onClick={() => handleFeedback('Fake')} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all text-sm font-medium">❌ Fake</button>
              <button onClick={() => handleFeedback('Not Sure')} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all text-sm font-medium">🤔 Not Sure</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};