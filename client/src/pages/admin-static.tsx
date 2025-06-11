import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminStatic() {
  const [preorders, setPreorders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadPreorders = async () => {
    setIsLoading(true);
    try {
      if (import.meta.env.VITE_GOOGLE_SHEET_ID && import.meta.env.VITE_GOOGLE_SHEETS_API_KEY) {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_GOOGLE_SHEET_ID}/values/Sheet1?key=${import.meta.env.VITE_GOOGLE_SHEETS_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const emails = data.values?.map((row: string[]) => row[0]).filter(Boolean) || [];
          setPreorders(emails);
        } else {
          throw new Error('Failed to load data');
        }
      } else {
        toast({
          title: "Configuration Missing",
          description: "Google Sheets API credentials not configured for static deployment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preorder data. Check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogleSheets = () => {
    if (import.meta.env.VITE_GOOGLE_SHEET_ID) {
      window.open(`https://docs.google.com/spreadsheets/d/${import.meta.env.VITE_GOOGLE_SHEET_ID}`, '_blank');
    } else {
      toast({
        title: "No Sheet Configured",
        description: "Google Sheet ID not set in environment variables.",
        variant: "destructive",
      });
    }
  };

  const downloadEmails = () => {
    if (preorders.length === 0) {
      toast({
        title: "No Data",
        description: "Load preorders first or no emails available.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = "Email\n" + preorders.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'growing-us-preorders.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-warm-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-deep-green mb-2">
            Growing Us - Static Admin
          </h1>
          <p className="text-deep-green/70">
            Manage pre-orders via Google Sheets integration
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
                {preorders.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Source</CardTitle>
              <ExternalLink className="h-4 w-4 text-deep-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-deep-green">
                Google Sheets
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <Download className="h-4 w-4 text-deep-teal" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={loadPreorders}
                  disabled={isLoading}
                  className="bg-deep-green hover:bg-deep-green/90"
                >
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-deep-teal" />
              Pre-order Management
            </CardTitle>
            <CardDescription>
              View and manage email signups for the Growing Us pre-order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button
                onClick={loadPreorders}
                disabled={isLoading}
                className="bg-deep-green hover:bg-deep-green/90"
              >
                {isLoading ? "Loading..." : "Load Preorders"}
              </Button>
              <Button
                variant="outline"
                onClick={openGoogleSheets}
                className="border-deep-green text-deep-green hover:bg-deep-green/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google Sheets
              </Button>
              <Button
                variant="outline"
                onClick={downloadEmails}
                disabled={preorders.length === 0}
                className="border-deep-green text-deep-green hover:bg-deep-green/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>

            {preorders.length === 0 ? (
              <div className="text-center py-8 text-deep-green/60">
                {isLoading ? "Loading preorders..." : "No pre-orders loaded. Click 'Load Preorders' to fetch data."}
              </div>
            ) : (
              <div className="space-y-3">
                {preorders.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-deep-green/20 rounded-lg hover:bg-sunflower/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-deep-teal" />
                      <span className="text-deep-green font-medium">
                        {email}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-sunflower/10 rounded-lg">
          <h3 className="font-medium text-deep-green mb-2">Static Deployment Info</h3>
          <p className="text-sm text-deep-green/70">
            This admin panel works with static deployment using Google Sheets API. 
            Configure your environment variables for full functionality.
          </p>
        </div>
      </div>
    </div>
  );
}