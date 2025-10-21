import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ResultCard } from './components/ResultCard';
import { Loader } from './components/Loader';
import { Footer } from './components/Footer';
import { analyzeMedia } from './services/geminiService';
import type { AnalysisResult } from './types';
import { SparklesIcon, ExclamationTriangleIcon, UploadIcon } from './components/Icons';
import { Instructions } from './components/ExamplePrompts';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
          setError('Please upload a valid image or video file.');
          return;
      }
      setFile(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleAnalysis = useCallback(async () => {
    if (!file) {
      setError('This tool only analyzes visual media. Please upload an image or video.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let fileData: { mimeType: string, data: string } | null = null;
      if (file) {
          const base64Data = await fileToBase64(file);
          fileData = { mimeType: file.type, data: base64Data };
      }
      const analysisResult = await analyzeMedia(inputText, fileData);
      setResult(analysisResult);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please check the console and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, file]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <Header />
        <main className="flex-grow w-full mt-8">
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="relative flex flex-col items-center justify-center w-full h-48 bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); handleFileChange({ target: e.dataTransfer } as any); }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                {previewUrl ? (
                  file?.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
                  ) : (
                    <video src={previewUrl} className="w-full h-full object-contain rounded-lg" controls={false} autoPlay loop muted />
                  )
                ) : (
                  <div className="text-center text-slate-500">
                    <UploadIcon />
                    <p className="mt-2 text-sm">Click or drag to upload media</p>
                  </div>
                )}
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Optionally, add a description or context for the media here..."
                className="w-full h-48 p-4 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow duration-300 resize-none text-slate-200 placeholder-slate-500"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleAnalysis}
              disabled={isLoading || !file}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
            >
              {isLoading ? (
                <>
                  <Loader />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Analyze Media
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center gap-3">
              <ExclamationTriangleIcon />
              <span>{error}</span>
            </div>
          )}
          
          {!isLoading && !result && !error && (
            <Instructions />
          )}

          {result && (
            <div className="mt-6">
              <ResultCard result={result} />
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;