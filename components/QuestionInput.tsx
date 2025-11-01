
import React from 'react';
import { Subject } from '../types';

interface QuestionInputProps {
  question: string;
  setQuestion: (question: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedSubject: Subject | null;
  hasImage?: boolean; // New prop
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ question, setQuestion, onSubmit, isLoading, selectedSubject, hasImage }) => {
  const isButtonDisabled = isLoading || !selectedSubject || (!question.trim() && !hasImage); // Adjust disabled logic

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isButtonDisabled) {
        onSubmit();
      }
    }
  };

  const getPlaceholder = () => {
    if (!selectedSubject) return "Please select a subject first";
    if (selectedSubject === Subject.Math && hasImage) {
      return "Ask a question about the image, or leave blank for a solution...";
    }
    return `Ask something about ${selectedSubject}...`;
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">2. Ask a Question</h2>
      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={!selectedSubject || isLoading}
          className="w-full h-28 p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-colors resize-none disabled:opacity-50"
        />
        <button
          onClick={onSubmit}
          disabled={isButtonDisabled}
          className="absolute bottom-3 right-3 px-5 py-2 bg-brand-green text-white font-bold rounded-md hover:bg-green-700 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-green"
        >
          {isLoading ? 'Thinking...' : 'Ask AI'}
        </button>
      </div>
    </div>
  );
};