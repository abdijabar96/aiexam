
import React from 'react';
import { SUBJECTS } from '../constants';
import { Subject } from '../types';

interface SubjectSelectorProps {
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
  isLoading: boolean;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubject, onSelectSubject, isLoading }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">1. Choose a Subject</h2>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => onSelectSubject(subject)}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
              ${selectedSubject === subject
                ? 'bg-brand-green text-white shadow-lg transform scale-105'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
};
