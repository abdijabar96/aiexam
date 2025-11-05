import React, { useMemo } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { marked } from 'marked';

interface AnswerDisplayProps {
  answer: string;
  isLoading: boolean;
  error: string | null;
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, isLoading, error }) => {
  const formattedAnswer = useMemo(() => {
    if (!answer) return '';
    marked.setOptions({
        breaks: true,
        gfm: true,
    });
    try {
        return marked.parse(answer) as string;
    } catch (e) {
        console.error("Markdown parsing error", e);
        // Fallback to plain text on error to avoid crashing the app
        return answer.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [answer]);

  const renderContent = () => {
    if (isLoading && !answer) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <LoadingSpinner className="w-10 h-10 text-brand-green" />
          <p className="mt-4 text-lg">The AI is thinking...</p>
          <p className="text-sm">Please wait a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (answer) {
      return (
         <div className="prose prose-invert max-w-none text-gray-200"
          dangerouslySetInnerHTML={{ __html: formattedAnswer }}>
        </div>
      );
    }
    
    return (
        <div className="text-center text-gray-500 py-10">
            <p>Your answer will appear here.</p>
            <p className="text-sm">Select a subject and ask a question to get started.</p>
        </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">3. AI Response</h2>
      <div className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-4 md:p-6 min-h-[200px]">
        {renderContent()}
      </div>
    </div>
  );
};