import React, { useState } from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface AccessCodeModalProps {
  onSubmit: (code: string) => boolean;
}

export const AccessCodeModal: React.FC<AccessCodeModalProps> = ({ onSubmit }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const isCorrect = onSubmit(code);
      if (!isCorrect) {
        setError('Invalid code. Please try again.');
      }
      setIsLoading(false);
      setCode('');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4">
                    <BookOpenIcon className="w-10 h-10 text-brand-green" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">
                        Kenya Syllabus AI Tutor
                    </h1>
                </div>
                 <p className="text-gray-400 mt-2">
                    Please enter the access code to continue.
                </p>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="access-code" className="block text-sm font-medium text-gray-300 mb-2">
                        Access Code
                        </label>
                        <input
                        type="password"
                        id="access-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-colors"
                        required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <div>
                        <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-5 py-3 bg-brand-green text-white font-bold rounded-md hover:bg-green-700 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-green"
                        >
                        {isLoading ? 'Verifying...' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};