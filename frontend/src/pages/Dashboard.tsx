import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { allDemoDatasets, calculateStats, Dataset } from '@/data/demoData';
import {
  Database,
  TrendingUp,
  LineChart,
  Lightbulb,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Activity,
  BarChart3,
  Download,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { generatePDF } from '@/utils/pdfGenerator';

const GuidedDemoCard: React.FC = () => {
  const { isDemoMode, guidedStep, setGuidedStep, setCurrentDataset } = useApp();

  if (!isDemoMode) return null;

  const steps = [
    { step: 1, title: 'Explore the Data', description: 'Understand what data is available', link: '/data-understanding' },
    { step: 2, title: 'Analyze Trends', description: 'View historical patterns and predictions', link: '/trends' },
    { step: 3, title: 'Review Policies', description: 'See actionable recommendations', link: '/policies' },
  ];

  const handleStepClick = (step: number) => {
    setGuidedStep(step);
    if (step === 1) {
      setCurrentDataset(allDemoDatasets[0]);
    }
  };

  return (
    <Card className="border-primary bg-primary/5 mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Guided Demo Mode
            </CardTitle>
            <CardDescription>Follow these steps to explore the platform</CardDescription>
          </div>
          <Badge variant="secondary">Demo Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(({ step, title, description, link }) => (
            <Link
              key={step}
              to={link}
              onClick={() => handleStepClick(step)}
              className="block"
            >
              <div
                className={`p-4 rounded-lg border transition-all ${guidedStep >= step
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${guidedStep >= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {guidedStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                  </div>
                  <span className="font-medium">{title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickStatsCard: React.FC<{ dataset: Dataset }> = ({ dataset }) => {
  const stats = useMemo(() => {
    if (!dataset.data.length) return null;
    const metricCol = dataset.metricColumns[0];
    const values = dataset.data.map((d) => (d as any)[metricCol] as number).filter(Boolean);
    return calculateStats(values);
  }, [dataset]);

  if (!stats) return null;

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Database className="h-4 w-4" />
            Data Points
          </div>
          <p className="text-2xl font-bold">{stats.count}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <BarChart3 className="h-4 w-4" />
            Average
          </div>
          <p className="text-2xl font-bold">{formatNumber(stats.mean)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="h-4 w-4" />
            Maximum
          </div>
          <p className="text-2xl font-bold">{formatNumber(stats.max)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Activity className="h-4 w-4" />
            Growth
          </div>
          <p className={`text-2xl font-bold ${stats.growthRate && stats.growthRate > 0 ? 'text-success' : 'text-destructive'}`}>
            {stats.growthRate ? `${stats.growthRate > 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%` : 'N/A'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const DatasetCard: React.FC<{ dataset: Dataset; onSelect: () => void }> = ({ dataset, onSelect }) => {
  const canPredict = dataset.type === 'TIME_SERIES' && dataset.data.length >= 6;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{dataset.name}</CardTitle>
          <Badge variant={dataset.type === 'TIME_SERIES' ? 'default' : 'secondary'}>
            {dataset.type === 'TIME_SERIES' ? 'Time Series' : 'Snapshot'}
          </Badge>
        </div>
        <CardDescription className="text-sm">{dataset.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              {dataset.data.length} records
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {[...new Set(dataset.data.map((d) => d.state))].length} regions
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canPredict ? (
              <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Prediction Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
                <AlertCircle className="h-3 w-3 mr-1" />
                Prediction Disabled
              </Badge>
            )}
          </div>

          <Button onClick={onSelect} className="w-full" variant="outline">
            Analyze Dataset
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { isDemoMode, currentDataset, setCurrentDataset } = useApp();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in" id="dashboard-content">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of available datasets and quick statistics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => generatePDF('dashboard-content', 'dashboard-report.pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Guided Demo Card */}
        <GuidedDemoCard />

        {/* STATE 1: ACTIVE SESSION (Real or Demo) */}
        {currentDataset && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <Activity className="h-6 w-6" />
                Active Analysis Session
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentDataset(null);
                  setCurrentFileId(null);
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                Close Session
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DatasetCard
                key={currentDataset.id}
                dataset={currentDataset}
                onSelect={() => { }}
              />
              <QuickStatsCard dataset={currentDataset} />
            </div>
          </div>
        )}

        {/* STATE 2: IDLE - REAL MODE (Show History) */}
        {!currentDataset && !isDemoMode && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-6 w-6 text-slate-700" />
                  Recent Uploads
                </h2>
                <p className="text-muted-foreground">Select a previous dataset or upload a new one</p>
              </div>
              <Button variant="default" asChild className="shadow-lg hover:scale-105 transition-transform">
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Dataset
                </Link>
              </Button>
            </div>
            <HistoryList />
          </div>
        )}

        {/* STATE 3: IDLE - DEMO MODE (Show Demo Scenarios) */}
        {!currentDataset && isDemoMode && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Select a Demo Scenario</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDemoDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  onSelect={() => setCurrentDataset(dataset)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/data-understanding" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Data Understanding</p>
                  <p className="text-xs text-muted-foreground">Schema & statistics</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/trends" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-secondary/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Trend Analysis</p>
                  <p className="text-xs text-muted-foreground">Historical patterns</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/predictions" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="font-medium">Predictions</p>
                  <p className="text-xs text-muted-foreground">Forecast future trends</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/policies" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Policy Insights</p>
                  <p className="text-xs text-muted-foreground">Recommendations</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Component for History List
const HistoryList: React.FC = () => {
  const { setCurrentFileId } = useApp();
  const [history, setHistory] = React.useState<any[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    import('@/services/api').then(({ apiService }) => {
      apiService.getHistory().then(setHistory).catch(console.error);
    });
  }, []);

  const handleSelect = (fileId: string) => {
    setActiveId(fileId);
    setCurrentFileId(fileId);
    // Timeout to clear loading state if it takes too long (fallback)
    setTimeout(() => setActiveId(null), 3000);
  };

  if (history.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {history.map((item) => (
        <Card
          key={item.file_id}
          className={`hover:border-primary/50 cursor-pointer transition-all ${activeId === item.file_id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
          onClick={() => handleSelect(item.file_id)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="truncate">
              <p className="font-medium truncate">{item.filename}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.upload_timestamp).toLocaleDateString()}</p>
            </div>
            {activeId === item.file_id ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
