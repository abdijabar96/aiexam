import React, { useState, useEffect } from 'react';

interface AccessCode {
  code: string;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCodes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/codes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCodes(data.accessCodes);
        setUsedCodes(data.usedCodes);
      }
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const generateCode = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/generate-code', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`New code generated: ${data.code}`);
        fetchCodes();
      } else {
        setMessage('Failed to generate code');
      }
    } catch (err) {
      setMessage('Error generating code');
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (code: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/delete-code', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        setMessage(`Code ${code} deleted`);
        fetchCodes();
      }
    } catch (err) {
      setMessage('Error deleting code');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generate Access Code</h2>
          <button
            onClick={generateCode}
            disabled={loading}
            className="bg-brand-green hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate New Code'}
          </button>
          {message && (
            <p className="mt-4 text-sm text-green-400">{message}</p>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Active Access Codes ({codes.length})</h2>
          {codes.length === 0 ? (
            <p className="text-gray-400">No active codes. Generate one above.</p>
          ) : (
            <div className="space-y-2">
              {codes.map((item) => (
                <div key={item.code} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                  <div>
                    <span className="font-mono text-lg text-brand-green">{item.code}</span>
                    <span className="text-gray-400 text-sm ml-4">Created: {new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => deleteCode(item.code)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Used Codes ({usedCodes.length})</h2>
          {usedCodes.length === 0 ? (
            <p className="text-gray-400">No codes have been used yet.</p>
          ) : (
            <div className="space-y-2">
              {usedCodes.map((code) => (
                <div key={code} className="bg-gray-700 p-3 rounded-lg">
                  <span className="font-mono text-gray-400">{code}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
