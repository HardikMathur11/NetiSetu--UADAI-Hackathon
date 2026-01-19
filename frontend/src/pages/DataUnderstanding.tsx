import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { calculateStats, allDemoDatasets } from '@/data/demoData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import {
  Database,
  Clock,
  MapPin,
  Hash,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Columns,
} from 'lucide-react';

const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}> = ({ label, value, icon, trend, description }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            {icon}
            {label}
          </p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        {trend && (
          <div className={`p-2 rounded-full ${trend === 'up' ? 'bg-success/10' : trend === 'down' ? 'bg-destructive/10' : 'bg-muted'}`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const ColumnCard: React.FC<{
  name: string;
  type: 'time' | 'region' | 'metric';
  description: string;
  sampleValues: string[];
}> = ({ name, type, description, sampleValues }) => {
  const typeColors = {
    time: 'bg-info/10 text-info border-info/30',
    region: 'bg-warning/10 text-warning border-warning/30',
    metric: 'bg-success/10 text-success border-success/30',
  };

  const typeIcons = {
    time: <Clock className="h-4 w-4" />,
    region: <MapPin className="h-4 w-4" />,
    metric: <Hash className="h-4 w-4" />,
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium">{name}</h4>
          <Badge variant="outline" className={typeColors[type]}>
            {typeIcons[type]}
            <span className="ml-1 capitalize">{type}</span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleValues.slice(0, 4).map((val, i) => (
            <Badge key={i} variant="secondary" className="text-xs font-normal">
              {val}
            </Badge>
          ))}
          {sampleValues.length > 4 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{sampleValues.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DataUnderstanding: React.FC = () => {
  const { currentDataset, setCurrentDataset, isDemoMode, setGuidedStep } = useApp();

  // Use first demo dataset if none selected
  const dataset = currentDataset || allDemoDatasets[0];

  // Calculate statistics for each metric column
  const columnStats = useMemo(() => {
    if (!dataset) return {};

    const stats: Record<string, ReturnType<typeof calculateStats>> = {};

    dataset.metricColumns.forEach((col) => {
      const values = dataset.data
        .map((row) => (row as any)[col] as number)
        .filter((v) => typeof v === 'number' && !isNaN(v));

      if (values.length > 0) {
        stats[col] = calculateStats(values);
      }
    });

    return stats;
  }, [dataset]);

  // Get unique values for columns
  const uniqueValues = useMemo(() => {
    if (!dataset) return {};

    const values: Record<string, string[]> = {};

    dataset.columns.forEach((col) => {
      const unique = [...new Set(dataset.data.map((row) => String((row as any)[col])))];
      values[col] = unique;
    });

    return values;
  }, [dataset]);

  // Check if dataset selected
  if (!dataset) {
    return (
      <DashboardLayout>
        <EmptyState title="No Dataset Selected" description="Please selection a dataset from the dashboard or upload your own data to view schema and statistics." />
      </DashboardLayout>
    );
  }

  const canPredict = dataset.type === 'TIME_SERIES' && dataset.data.length >= 6;
  const uniqueTimePoints = dataset.timeColumn
    ? [...new Set(dataset.data.map((row) => (row as any)[dataset.timeColumn!]))].length
    : 0;

  const handleContinue = () => {
    if (isDemoMode) {
      setGuidedStep(2);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{dataset.name}</h1>
            <p className="text-muted-foreground">{dataset.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={dataset.type === 'TIME_SERIES' ? 'default' : 'secondary'}>
              {dataset.type === 'TIME_SERIES' ? 'Time Series' : 'Snapshot'}
            </Badge>
            {canPredict ? (
              <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Prediction Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Prediction Disabled
              </Badge>
            )}
          </div>
        </div>

        {/* Prediction Notice */}
        {!canPredict && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {dataset.type === 'SNAPSHOT'
                ? 'This is snapshot data without a time dimension. Time-based predictions are not applicable.'
                : `Only ${uniqueTimePoints} time points available. Prediction requires at least 6 time points for reliable forecasting.`}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="schema" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schema">Schema Detection</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
          </TabsList>

          {/* Schema Tab */}
          <TabsContent value="schema" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Columns className="h-5 w-5 text-primary" />
                  Detected Columns
                </CardTitle>
                <CardDescription>
                  The system automatically detected these column types and their purposes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataset.timeColumn && (
                    <ColumnCard
                      name={dataset.timeColumn}
                      type="time"
                      description="Represents the time dimension for trend analysis"
                      sampleValues={uniqueValues[dataset.timeColumn] || []}
                    />
                  )}

                  {dataset.regionColumn && (
                    <ColumnCard
                      name={dataset.regionColumn}
                      type="region"
                      description="Geographic or categorical grouping dimension"
                      sampleValues={uniqueValues[dataset.regionColumn] || []}
                    />
                  )}

                  {dataset.metricColumns.map((col) => (
                    <ColumnCard
                      key={col}
                      name={col}
                      type="metric"
                      description="Numeric values for analysis and prediction"
                      sampleValues={uniqueValues[col]?.slice(0, 5) || []}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feature Availability</CardTitle>
                <CardDescription>
                  Based on the detected schema, these features are available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg border bg-success/5 border-success/20">
                    <CheckCircle2 className="h-5 w-5 text-success mb-2" />
                    <p className="font-medium text-sm">Summary Statistics</p>
                    <p className="text-xs text-muted-foreground">Always available</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${dataset.type === 'TIME_SERIES' ? 'bg-success/5 border-success/20' : 'bg-muted border-border'}`}>
                    {dataset.type === 'TIME_SERIES' ? (
                      <CheckCircle2 className="h-5 w-5 text-success mb-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground mb-2" />
                    )}
                    <p className="font-medium text-sm">Trend Analysis</p>
                    <p className="text-xs text-muted-foreground">
                      {dataset.type === 'TIME_SERIES' ? 'Time series detected' : 'Requires time column'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${canPredict ? 'bg-success/5 border-success/20' : 'bg-muted border-border'}`}>
                    {canPredict ? (
                      <CheckCircle2 className="h-5 w-5 text-success mb-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground mb-2" />
                    )}
                    <p className="font-medium text-sm">Predictions</p>
                    <p className="text-xs text-muted-foreground">
                      {canPredict ? `${uniqueTimePoints} time points` : 'Requires ≥6 time points'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-success/5 border-success/20">
                    <CheckCircle2 className="h-5 w-5 text-success mb-2" />
                    <p className="font-medium text-sm">Policy Insights</p>
                    <p className="text-xs text-muted-foreground">Always available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4">
            {dataset.metricColumns.map((col) => {
              const stats = columnStats[col];
              if (!stats) return null;

              return (
                <Card key={col}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      {col}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <StatCard
                        label="Count"
                        value={stats.count}
                        icon={<Database className="h-3.5 w-3.5" />}
                      />
                      <StatCard
                        label="Minimum"
                        value={formatNumber(stats.min)}
                        icon={<TrendingDown className="h-3.5 w-3.5" />}
                      />
                      <StatCard
                        label="Maximum"
                        value={formatNumber(stats.max)}
                        icon={<TrendingUp className="h-3.5 w-3.5" />}
                      />
                      <StatCard
                        label="Average"
                        value={formatNumber(stats.mean)}
                        icon={<BarChart3 className="h-3.5 w-3.5" />}
                      />
                      <StatCard
                        label="Growth Rate"
                        value={stats.growthRate !== undefined ? `${stats.growthRate > 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%` : 'N/A'}
                        icon={<TrendingUp className="h-3.5 w-3.5" />}
                        trend={stats.growthRate !== undefined ? (stats.growthRate > 0 ? 'up' : stats.growthRate < 0 ? 'down' : 'neutral') : undefined}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Preview</CardTitle>
                <CardDescription>
                  Showing first 10 rows of {dataset.data.length} total records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {dataset.columns.map((col) => (
                          <th key={col} className="text-left p-3 font-medium bg-muted/50">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.data.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                          {dataset.columns.map((col) => (
                            <td key={col} className="p-3">
                              {typeof (row as any)[col] === 'number'
                                ? (row as any)[col].toLocaleString()
                                : (row as any)[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard">← Back to Dashboard</Link>
          </Button>
          <Button asChild onClick={handleContinue}>
            <Link to="/trends">
              Continue to Trend Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DataUnderstanding;
