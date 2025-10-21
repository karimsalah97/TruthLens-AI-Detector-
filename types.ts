export type Verdict = 'Likely Real' | 'Possibly AI-Generated' | 'Clearly AI-Generated' | 'Manipulated' | 'Uncertain';
export type Confidence = 'High' | 'Medium' | 'Low' | 'Unknown';

export interface AnalysisResult {
  description: string;
  verdict: Verdict;
  confidence: Confidence;
  reasoning: string;
  reflection: string;
}