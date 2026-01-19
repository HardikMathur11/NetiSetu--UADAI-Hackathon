import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { allDemoDatasets } from '@/data/demoData';
import { useTrends, useRegions } from '@/hooks/useApi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export const Trends: React.FC = () => {
  const { currentDataset, selectedState, setSelectedState, isDemoMode, currentFileId, isBackendConnected } = useApp();

  if (!currentDataset) {
    return (
      <DashboardLayout>
        <EmptyState title="No Data for Trends" description="Select a dataset to view trend analysis." />
      </DashboardLayout>
    );
  }

  const dataset = currentDataset;
  const [selectedMetric, setSelectedMetric] = useState(dataset.metricColumns[0]);

  const useBackendApi = !isDemoMode && isBackendConnected && currentFileId;

  // API-based data
  const { data: apiTrends, isLoading: isTrendsLoading } = useTrends(
    currentFileId,
    selectedMetric,
    selectedState,
    !!useBackendApi
  );

  const { data: apiRegions } = useRegions(currentFileId, !!useBackendApi);

  // Local states
  const states = useMemo(() => {
    if (useBackendApi && apiRegions) {
      return ['all', ...apiRegions.regions];
    }
    return ['all', ...new Set(dataset.data.map((d) => d.state))];
  }, [dataset, useBackendApi, apiRegions]);

  // Chart data
  const chartData = useMemo(() => {
    // API mode
    if (useBackendApi && apiTrends) {
      return apiTrends.data.map((d) => ({
        period: d.period,
        value: d.value,
        movingAvg: d.movingAvg,
      }));
    }

    // Demo/local mode
    let filtered = dataset.data;
    if (selectedState !== 'all') {
      filtered = filtered.filter((d) => d.state === selectedState);
    }

    const timeCol = dataset.timeColumn;
    if (!timeCol) return filtered;

    const grouped = filtered.reduce((acc, row) => {
      const key = (row as any)[timeCol];
      if (!acc[key]) acc[key] = { [timeCol]: key, values: [] };
      acc[key].values.push((row as any)[selectedMetric]);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((g: any) => ({
      period: g[timeCol!],
      value: g.values.reduce((a: number, b: number) => a + b, 0) / g.values.length,
    }));
  }, [dataset, selectedState, selectedMetric, useBackendApi, apiTrends]);

  const formatValue = (val: number) => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    return val.toLocaleString();
  };

  if (useBackendApi && isTrendsLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading trends from server...</span>
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
            <h1 className="text-2xl font-bold">Trend Analysis</h1>
            <p className="text-muted-foreground">Historical patterns and growth analysis</p>
          </div>
          <Badge variant={dataset.type === 'TIME_SERIES' ? 'default' : 'secondary'}>
            {dataset.type}
          </Badge>
        </div>

        <div className="flex gap-4">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent>
              {states.map((s) => <SelectItem key={s} value={s}>{s === 'all' ? 'All States' : s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {dataset.metricColumns.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {selectedMetric} Over Time
            </CardTitle>
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
                  <Line type="monotone" dataKey="value" name={selectedMetric} stroke="hsl(var(--chart-primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" asChild><Link to="/data-understanding">← Data Understanding</Link></Button>
          <Button asChild><Link to="/predictions">View Predictions <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trends;
