import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Settings as SettingsIcon, Server, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    backendUrl,
    setBackendUrl,
    isBackendConnected,
    setIsBackendConnected,
    isDemoMode,
    setIsDemoMode
  } = useApp();

  const [urlInput, setUrlInput] = useState(backendUrl);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      apiService.setBaseUrl(urlInput);
      const isHealthy = await apiService.healthCheck();
      setIsBackendConnected(isHealthy);
      setBackendUrl(urlInput);
      setLastCheckTime(new Date());
    } catch {
      setIsBackendConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();
  }, []);

  const handleSaveUrl = () => {
    setBackendUrl(urlInput);
    checkConnection();
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">Configure backend connection and application settings</p>
        </div>

        {/* Demo Mode Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo Mode</CardTitle>
            <CardDescription>Toggle between demo data and live backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Use Demo Data</p>
                <p className="text-sm text-muted-foreground">
                  When enabled, the app uses pre-loaded sample data instead of the backend API
                </p>
              </div>
              <Switch
                checked={isDemoMode}
                onCheckedChange={setIsDemoMode}
              />
            </div>
            {isDemoMode && (
              <Alert className="mt-4">
                <AlertDescription>
                  Demo mode is active. All data is pre-loaded and no backend connection is required.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Backend Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5" />
              Backend Status
            </CardTitle>
            <CardDescription>
              Connection status to the NitiSetu Analytics Engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isBackendConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">
                      {isBackendConnected ? 'Connected' : 'Not Connected'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isBackendConnected
                        ? 'Backend connection established successfully.'
                        : 'Unable to reach backend server.'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={checkConnection} disabled={isChecking}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              {lastCheckTime && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last checked: {lastCheckTime.toLocaleTimeString()}
                </p>
              )}
            </div>

            {!isBackendConnected && !isDemoMode && (
              <Alert variant="destructive">
                <AlertDescription>
                  Backend is not connected. Please check your network or contact support.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Endpoints Reference</CardTitle>
            <CardDescription>Available endpoints on your backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">POST</Badge>
                <span>/api/upload</span>
                <span className="text-muted-foreground ml-auto">Upload CSV</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">GET</Badge>
                <span>/api/schema/:id</span>
                <span className="text-muted-foreground ml-auto">Get schema</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">GET</Badge>
                <span>/api/stats/:id</span>
                <span className="text-muted-foreground ml-auto">Get statistics</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">GET</Badge>
                <span>/api/trends/:id</span>
                <span className="text-muted-foreground ml-auto">Get trends</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">GET</Badge>
                <span>/api/predict/:id</span>
                <span className="text-muted-foreground ml-auto">Get predictions</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">GET</Badge>
                <span>/api/policies/:id</span>
                <span className="text-muted-foreground ml-auto">Get policies</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
