import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Calendar, Users, Download, Lock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Preorder } from '@shared/schema';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Always call useQuery hook, but conditionally enable it
  const { data: preorders, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/preorders'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/preorders');
      const result = await response.json();
      return result.data as Preorder[];
    },
    enabled: isAuthenticated
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'annaandi') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-deep-green">
              <Lock className="h-5 w-5" />
              Admin Access
            </CardTitle>
            <CardDescription>
              Enter the password to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-deep-green">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="border-deep-green/30 focus:border-deep-teal"
                />
                {authError && (
                  <p className="text-sm text-red-600">{authError}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-sunflower hover:bg-sunflower/90 text-deep-green font-semibold"
              >
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const downloadCSV = () => {
    if (!preorders || preorders.length === 0) return;
    
    const csvContent = [
      'Email,Date Registered',
      ...preorders.map(p => `${p.email},${new Date(p.createdAt).toLocaleDateString()}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `growing-us-preorders-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-deep-green text-lg">Loading pre-orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Pre-orders</CardTitle>
            <CardDescription>
              There was an issue fetching the pre-order data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-deep-green mb-2">
            Growing Us - Admin Dashboard
          </h1>
          <p className="text-deep-green/70">
            Manage pre-orders and customer data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pre-orders</CardTitle>
              <Users className="h-4 w-4 text-deep-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-green">
                {preorders?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-sunflower" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-green">
                ${((preorders?.length || 0) * 18.75).toFixed(2)}
              </div>
              <p className="text-xs text-deep-green/60">
                At 25% discount ($18.75/deck)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <Download className="h-4 w-4 text-deep-green" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={downloadCSV}
                disabled={!preorders || preorders.length === 0}
                className="w-full bg-sunflower hover:bg-sunflower/90 text-deep-green"
              >
                Download CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-deep-teal" />
              Pre-order List
            </CardTitle>
            <CardDescription>
              All registered email addresses for the Growing Us pre-order
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!preorders || preorders.length === 0 ? (
              <div className="text-center py-8 text-deep-green/60">
                No pre-orders yet. Start promoting the game!
              </div>
            ) : (
              <div className="space-y-3">
                {preorders.map((preorder) => (
                  <div
                    key={preorder.id}
                    className="flex items-center justify-between p-3 border border-deep-green/20 rounded-lg hover:bg-sunflower/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-deep-teal" />
                      <span className="text-deep-green font-medium">
                        {preorder.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(preorder.createdAt).toLocaleDateString()}
                      </Badge>
                      <Badge className="bg-sunflower text-deep-green text-xs">
                        25% OFF
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}