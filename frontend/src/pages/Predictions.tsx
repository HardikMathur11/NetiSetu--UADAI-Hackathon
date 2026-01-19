import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';
import { allDemoDatasets, linearRegression } from '@/data/demoData';
import { usePredictions } from '@/hooks/useApi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon, ArrowRight, AlertCircle, Info, CheckCircle2, Loader2 } from 'lucide-react';

export const Predictions: React.FC = () => {
  const { currentDataset, setGuidedStep, isDemoMode, currentFileId, isBackendConnected } = useApp();

  if (!currentDataset) {
    return (
      <DashboardLayout>
        <EmptyState title="No Data for Predictions" description="Select a dataset to view future forecasts." />
      </DashboardLayout>
    );
  }

  const dataset = currentDataset;
  const metricCol = dataset.metricColumns[0];

  const canPredict = dataset.type === 'TIME_SERIES' && dataset.data.length >= 6;
  const useBackendApi = !isDemoMode && isBackendConnected && currentFileId;

  // API-based predictions
  const { data: apiPredictions, isLoading: isApiLoading } = usePredictions(
    currentFileId,
    metricCol,
    6,
    !!useBackendApi
  );

  // Client-side predictions (demo mode)
  const localPredictionData = useMemo(() => {
    if (useBackendApi || !canPredict || !dataset.timeColumn) return null;

    const timeValues = dataset.data.map((_, i) => i + 1);
    const metricValues = dataset.data.map((d) => (d as any)[metricCol] as number);

    return linearRegression(timeValues, metricValues, 6);
  }, [dataset, canPredict, metricCol, useBackendApi]);

  // Build chart data
  const chartData = useMemo(() => {
    if (!dataset.timeColumn) return [];

    // API mode
    if (useBackendApi && apiPredictions) {
      const historical = apiPredictions.historical.map((h) => ({
        period: h.period,
        historical: h.value,
        predicted: null as number | null,
      }));

      if (apiPredictions.canPredict) {
        apiPredictions.predictions.forEach((p) => {
          historical.push({
            period: p.period,
            historical: null as any,
            predicted: p.value,
          });
        });
      }
      return historical;
    }

    // Demo/local mode
    const historical = dataset.data.map((d, i) => ({
      period: (d as any)[dataset.timeColumn!],
      historical: (d as any)[metricCol],
      predicted: null as number | null,
    }));

    if (localPredictionData?.canPredict) {
      localPredictionData.predictions.forEach((p, i) => {
        historical.push({
          period: `Forecast ${i + 1}`,
          historical: null as any,
          predicted: p.value,
        });
      });
    }
    return historical;
  }, [dataset, localPredictionData, metricCol, useBackendApi, apiPredictions]);

  // Determine prediction state
  const isPredictionEnabled = useBackendApi
    ? apiPredictions?.canPredict
    : canPredict && localPredictionData?.canPredict;

  const r2Score = useBackendApi
    ? apiPredictions?.r2Score
    : localPredictionData?.r2;

  const formatValue = (val: number) => {
    if (!val) return '';
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    return val.toLocaleString();
  };

  const handleContinue = () => { if (isDemoMode) setGuidedStep(3); };

  if (useBackendApi && isApiLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading predictions from server...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Predictions</h1>
            <p className="text-muted-foreground">Explainable linear regression forecasts</p>
          </div>
          {isPredictionEnabled ? (
            <Badge className="bg-success text-success-foreground"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Prediction Enabled</Badge>
          ) : (
            <Badge variant="secondary"><AlertCircle className="h-3.5 w-3.5 mr-1" />Prediction Disabled</Badge>
          )}
        </div>

        {!isPredictionEnabled && (
          <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>
            {dataset.type === 'SNAPSHOT' ? 'Snapshot data does not support predictions.' : 'Requires at least 6 time points.'}
          </AlertDescription></Alert>
        )}

        {isPredictionEnabled && (
          <>
            <Alert className="bg-info/10 border-info/30"><Info className="h-4 w-4 text-info" /><AlertDescription>
              <strong>Assumption:</strong> Predictions based on historical linear trend. R² = {r2Score?.toFixed(3)}
            </AlertDescription></Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5 text-primary" />Historical vs Predicted</CardTitle>
                <CardDescription>Solid line = historical data, Dashed line = forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" className="text-xs" />
                      <YAxis tickFormatter={formatValue} className="text-xs" />
                      <Tooltip formatter={(val: number) => formatValue(val)} />
                      <Legend />
                      <Line type="monotone" dataKey="historical" name="Historical" stroke="hsl(var(--chart-primary))" strokeWidth={2} dot />
                      <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(var(--chart-prediction))" strokeWidth={2} strokeDasharray="5 5" dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex justify-between">
          <Button variant="outline" asChild><Link to="/trends">← Trend Analysis</Link></Button>
          <Button asChild onClick={handleContinue}><Link to="/policies">View Policy Insights <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Predictions;
