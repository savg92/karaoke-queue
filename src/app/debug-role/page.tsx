'use client';

import { useState } from 'react';
import { debugUserProfile } from '@/app/actions/debug-profile';
import { Button } from '@/components/ui/button';

export default function DebugRolePage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    setLoading(true);
    try {
      const debugResult = await debugUserProfile();
      setResult(debugResult);
      console.log('Debug result:', debugResult);
    } catch (error) {
      console.error('Debug error:', error);
      setResult({ error: 'Failed to run debug' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Role Debug Page</h1>
      
      <Button 
        onClick={handleDebug}
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Running Debug...' : 'Debug User Profile'}
      </Button>

      {result && (
        <div className="mt-4 p-4">
          <h2 className="font-bold mb-2">Debug Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
