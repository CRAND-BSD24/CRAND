'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkDatabase } from '../check-db';

export default function DebugDatabase() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runCheck() {
      try {
        const res = await checkDatabase();
        setResult(res);
      } catch (error) {
        console.error('Error running check:', error);
        setResult({ error: 'Failed to run database check' });
      } finally {
        setLoading(false);
      }
    }

    runCheck();
  }, []);

  return (
    <div className="p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Database Debug</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <h2 className="text-lg font-bold mb-2">Results:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
                {JSON.stringify(result, null, 2)}
              </pre>
              <p className="mt-4 text-sm text-gray-600">
                Check console for detailed logs
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 