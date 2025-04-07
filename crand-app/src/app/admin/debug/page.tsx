'use client';

import { useState } from 'react';
import { findTeacherByName } from '../action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [name, setName] = useState('Yusuf');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await findTeacherByName(name);
      setResult(JSON.parse(data));
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Teacher Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter teacher name"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h2 className="text-lg font-bold mb-2">Results:</h2>
              <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 