import React, { useState, useEffect } from 'react';

interface AccessCodeGateProps {
  children: React.ReactNode;
}

export const AccessCodeGate: React.FC<AccessCodeGateProps> = ({ children }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const accessGranted = localStorage.getItem('tutorAccess');
    if (accessGranted === 'true') {
      setHasAccess(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('tutorAccess', 'true');
        setHasAccess(true);
      } else {
        setError(data.error || 'Invalid or expired access code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Kenya Syllabus AI Tutor</h1>
          <p className="text-gray-400">Enter your access code to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-300 mb-2">
              Access Code
            </label>
            <input
              id="accessCode"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-brand-green focus:border-transparent font-mono text-center text-lg"
              placeholder="Enter code"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Tutor'}
          </button>
        </form>
        
        <p className="text-gray-500 text-xs text-center mt-6">
          Contact your administrator if you need an access code.
        </p>
      </div>
    </div>
  );
};
