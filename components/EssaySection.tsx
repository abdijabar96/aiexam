import React from 'react';
import { Subject } from '../types';
import { SET_BOOKS } from '../constants';

interface EssaySectionProps {
  selectedSubject: Subject.English | Subject.Kiswahili;
  isLoading: boolean;
  onSubmit: () => void;
  selectedBook: string;
  setSelectedBook: (book: string) => void;
  essayQuestion: string;
  setEssayQuestion: (question: string) => void;
}

export const EssaySection: React.FC<EssaySectionProps> = ({
  selectedSubject,
  isLoading,
  onSubmit,
  selectedBook,
  setSelectedBook,
  essayQuestion,
  setEssayQuestion,
}) => {
  const books = SET_BOOKS[selectedSubject] || [];
  const isButtonDisabled = isLoading || !selectedBook || !essayQuestion.trim();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isButtonDisabled) {
        onSubmit();
      }
    }
  };

  const getPlaceholderText = () => {
    if (selectedSubject === Subject.English) {
        return "e.g., Discuss the theme of betrayal in 'Fathers of Nations'...";
    }
    if (selectedSubject === Subject.Kiswahili) {
        return "k.m., Jadili maudhui ya uongozi mbaya katika riwaya ya 'Chozi la Heri'...";
    }
    return "Ask an essay question...";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">2. Select a Set Book</h2>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          disabled={isLoading}
          className="w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-colors disabled:opacity-50"
          aria-label="Select a set book"
        >
          <option value="" disabled>-- Choose a book --</option>
          {books.map((book) => (
            <option key={book} value={book}>{book}</option>
          ))}
        </select>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">3. Ask an Essay Question</h2>
        <div className="relative">
          <textarea
            value={essayQuestion}
            onChange={(e) => setEssayQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholderText()}
            disabled={!selectedBook || isLoading}
            className="w-full h-28 p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-colors resize-none disabled:opacity-50"
            aria-label="Essay question"
          />
          <button
            onClick={onSubmit}
            disabled={isButtonDisabled}
            className="absolute bottom-3 right-3 px-5 py-2 bg-brand-green text-white font-bold rounded-md hover:bg-green-700 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-green"
          >
            {isLoading ? 'Writing...' : 'Generate Essay'}
          </button>
        </div>
      </div>
    </div>
  );
};
