import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { allDemoDatasets, calculateStats, generatePolicyRecommendations, PolicyRecommendation } from '@/data/demoData';
import { usePolicies } from '@/hooks/useApi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { Lightbulb, ArrowRight, TrendingUp, Users, Building, Target, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const confidenceColors = {
  high: 'bg-confidence-high text-white',
  medium: 'bg-confidence-medium text-white',
  low: 'bg-confidence-low text-white',
};

const categoryIcons: Record<string, any> = {
  growth: TrendingUp,
  infrastructure: Building,
  outreach: Users,
  disparity: Target,
  equity: Target,
  operations: Building,
  data: TrendingUp,
  monitoring: TrendingUp,
};

const PolicyCard: React.FC<{ policy: PolicyRecommendation | any }> = ({ policy }) => {
  const Icon = categoryIcons[policy.category] || TrendingUp;
  const trigger = policy.triggerCondition || policy.trigger;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{policy.title}</CardTitle>
              <Badge variant="outline" className="mt-1 capitalize">{policy.category}</Badge>
            </div>
          </div>
          <Badge className={confidenceColors[policy.confidence as keyof typeof confidenceColors]}>{policy.confidence} confidence</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{policy.description}</p>
        <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
          <p><strong>Trigger:</strong> {trigger}</p>
          <p><strong>Expected Impact:</strong> {policy.expectedImpact}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const Policies: React.FC = () => {
  const { currentDataset, setGuidedStep, currentFileId, isBackendConnected, isDemoMode } = useApp();
  const dataset = currentDataset;
  const metricCol = dataset?.metricColumns[0];

  console.log("Policies Debug - Context:", { currentFileId, isBackendConnected, isDemoMode });

  // Determine if we should use backend data
  const useBackendApi = isBackendConnected && currentFileId && !isDemoMode;

  // API-based policies
  const { data: apiPolicies, isLoading: isApiLoading, error } = usePolicies(currentFileId, !!useBackendApi);
  console.log("Policies Debug - API Response:", { apiPolicies, isApiLoading, error });

  // Local policies calculation for Demo Mode
  const localRecommendations = useMemo(() => {
    if (!isDemoMode || !dataset) return [];

    // Extract metric values
    const metricValues = dataset.data
      .map((d: any) => d[metricCol] as number)
      .filter((val) => typeof val === 'number');

    // Calculate stats
    const stats = calculateStats(metricValues);

    // Get regional data if available
    let regionalData: { state: string; value: number }[] | undefined;
    if (dataset.regionColumn) {
      regionalData = dataset.data.map((d: any) => ({
        state: d[dataset.regionColumn],
        value: d[metricCol]
      }));
    }

    return generatePolicyRecommendations(stats, dataset.type, regionalData);
  }, [isDemoMode, dataset, metricCol]);

  // Determine which recommendations to show
  const recommendations = isDemoMode ? localRecommendations : (apiPolicies?.recommendations || []);

  const handleComplete = () => { setGuidedStep(3); };

  if (!currentDataset) {
    return (
      <DashboardLayout>
        <EmptyState title="No Policies Generated" description="Select a dataset to view AI-driven policy recommendations." />
      </DashboardLayout>
    );
  }

  // Combine loading states for a single check
  const loading = useBackendApi && isApiLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">Consulting AI Policy Engine...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Only show error if NOT in demo mode and API failed
  if (!isDemoMode && error && useBackendApi) {
    return (
      <DashboardLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-2" />
          <h2 className="text-xl font-semibold text-destructive">Data Session Expired</h2>
          <div className="text-center text-muted-foreground max-w-md">
            <p>The session for file ID <code className="text-xs bg-slate-100 px-1 py-0.5 rounded border">{currentFileId}</code> has expired.</p>
            <p className="mt-2 text-sm">Please upload your file again to generate new recommendations.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/upload">Upload File Again</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasAiContent = recommendations.some((r: any) => r.isAiGenerated);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Policy Insights
              {hasAiContent && <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Powered</Badge>}
            </h1>
            <p className="text-muted-foreground">{hasAiContent ? "AI-generated recommendations based on your unique data context" : "Rule-based recommendations for government decision-makers"}</p>
          </div>
          <Badge><Lightbulb className="h-3.5 w-3.5 mr-1" />{recommendations.length} Recommendations</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {recommendations.map((policy: any) => <PolicyCard key={policy.id} policy={policy} />)}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Transparency Note</p>
                <p className="text-muted-foreground">
                  {hasAiContent
                    ? "These recommendations were generated by Google Gemini AI based on the statistical analysis of your uploaded data. Please verify with subject matter experts."
                    : "All recommendations are generated using rule-based logic with clear triggering conditions. No black-box AI models are used."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" asChild><Link to="/predictions">← Predictions</Link></Button>
          <Button asChild onClick={handleComplete}><Link to="/summary">View Summary Report <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Policies;
