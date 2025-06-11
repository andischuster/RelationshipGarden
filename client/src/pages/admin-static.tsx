import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GoogleSheetsAPI } from '@/lib/google-forms-client';

interface EmailEntry {
  email: string;
  timestamp?: string;
}

export default function AdminStatic() {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = () => {
    if (password === 'admin123') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const loadEmails = async () => {
    setLoading(true);
    try {
      // These would be environment variables in a real deployment
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
      
      if (!sheetId || !apiKey) {
        throw new Error('Google Sheets configuration missing');
      }

      const sheets = new GoogleSheetsAPI(sheetId, apiKey);
      const emailList = await sheets.getEmails();
      
      setEmails(emailList.map(email => ({ email })));
    } catch (err) {
      setError('Failed to load emails from Google Sheets');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      loadEmails();
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button onClick={handleAuth} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pre-order Dashboard (Static)</CardTitle>
              <p className="text-muted-foreground mt-1">
                Email signups from Google Sheets
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {emails.length} Total
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Email Addresses</h3>
              <Button onClick={loadEmails} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              {emails.length === 0 && !loading ? (
                <p className="text-muted-foreground text-center py-8">
                  No emails found. Check your Google Sheets configuration.
                </p>
              ) : (
                emails.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{entry.email}</p>
                      {entry.timestamp && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                ))
              )}
            </div>

            {emails.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{emails.length}</p>
                    <p className="text-sm text-muted-foreground">Total Signups</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {emails.filter(e => e.email.includes('@gmail')).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Gmail Users</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {new Set(emails.map(e => e.email.split('@')[1])).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Unique Domains</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}