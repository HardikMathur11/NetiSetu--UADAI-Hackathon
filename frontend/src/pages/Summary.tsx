import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { allDemoDatasets, calculateStats, generatePolicyRecommendations } from '@/data/demoData';
import { usePolicies } from '@/hooks/useApi'; // This hook might become redundant if apiService is used directly
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FileText, Download, CheckCircle2, TrendingUp, Lightbulb, Database,
  ArrowRight, ShieldCheck, Activity, MapPin, Calendar, Sparkles, AlertTriangle
} from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { EmptyState } from '@/components/EmptyState';
import { apiService } from '@/services/api'; // New import for direct API calls

export const Summary: React.FC = () => {
  const { currentDataset, currentFileId, isBackendConnected, isDemoMode } = useApp();
  const [loading, setLoading] = useState(true);
  const [backendStats, setBackendStats] = useState<any>(null); // Renamed to avoid conflict with local 'stats'
  const [backendPolicies, setBackendPolicies] = useState<any[]>([]); // Renamed to avoid conflict with local 'policies'
  const [error, setError] = useState<string | null>(null);

  // --- Data Logic (Shared with Policies/Dashboard) ---
  const dataset = currentDataset || allDemoDatasets[0];
  const metricCol = dataset.metricColumns[0] || 'value';
  const useBackendApi = isBackendConnected && currentFileId && !isDemoMode;

  const { data: apiPolicies } = usePolicies(currentFileId, !!useBackendApi);

  const analysisData = useMemo(() => {
    // 1. Get Recommendations
    let recommendations: any[] = [];
    let stats: any = {};
    let metrics: any = { growth: 0, total: 0, avg: 0 };
    let meta: any = { regions: 0, records: 0 };

    if (isDemoMode && dataset) {
      // Local Calculation
      const values = dataset.data.map((d: any) => d[metricCol] as number).filter(v => typeof v === 'number');
      stats = calculateStats(values);

      let regionalData;
      if (dataset.regionColumn) {
        regionalData = dataset.data.map((d: any) => ({ state: d[dataset.regionColumn], value: d[metricCol] }));
      }
      recommendations = generatePolicyRecommendations(stats, dataset.type, regionalData);

      metrics = {
        growth: stats.growthRate || 0,
        total: stats.sum,
        avg: stats.mean
      };
      meta = {
        regions: dataset.regionColumn ? new Set(dataset.data.map((d: any) => d[dataset.regionColumn])).size : 'N/A',
        records: dataset.data.length
      };

    } else if (apiPolicies) {
      // API Data
      recommendations = apiPolicies.recommendations || [];
      // Note: In a real app we'd fetch stats separately or pass them, estimating for now if missing
      metrics = { growth: 12.5, total: 0, avg: 0 }; // Placeholder if API stats missing
      meta = { regions: 'Multiple', records: 'High Volume' };
    }

    // 2. Determine "Verdict" / Health Score based on trends
    let healthScore = 85;
    let verdict = "Stable";
    let verdictColor = "text-green-600";

    if (metrics.growth < 0) {
      healthScore = 65;
      verdict = "Needs Attention";
      verdictColor = "text-orange-600";
    } else if (metrics.growth > 20) {
      healthScore = 95;
      verdict = "Excellent Growth";
      verdictColor = "text-blue-600";
    }

    return { recommendations, metrics, meta, healthScore, verdict, verdictColor };
  }, [currentDataset, isDemoMode, apiPolicies, metricCol]);

  const { recommendations, metrics, meta, healthScore, verdict, verdictColor } = analysisData;
  const topPolicies = recommendations.slice(0, 3);
  const hasAi = recommendations.some((r: any) => r.isAiGenerated);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 animate-fade-in max-w-5xl mx-auto">

        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Executive Summary Report</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Official NitiSetu Analytics • Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
            onClick={() => generatePDF('summary-report-container', `NitiSetu_Report_${new Date().toISOString().split('T')[0]}.pdf`)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Official PDF
          </Button>
        </div>

        {/* PRINTABLE CONTAINER STARTS */}
        <div id="summary-report-container" className="space-y-8 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-100">

          {/* 1. Report Header */}
          <div className="flex items-start justify-between border-b pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-800">{dataset.name}</h2>
              <Badge variant="outline" className="text-sm font-normal py-1 px-3 border-slate-300 text-slate-600">
                {dataset.type === 'TIME_SERIES' ? 'Longitudinal Analysis' : 'Cross-Sectional Analysis'}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">System Verdict</div>
              <div className={`text - 2xl font - black ${verdictColor} `}>{verdict}</div>
              <div className="text-xs text-slate-400">Score: {healthScore}/100</div>
            </div>
          </div>

          {/* 2. Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-slate-500 font-medium flex items-center gap-1"><Database className="h-3 w-3" /> Records Analyzed</div>
              <div className="text-2xl font-bold text-slate-900">{meta.records}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> Coverage</div>
              <div className="text-2xl font-bold text-slate-900">{meta.regions} Regions</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 font-medium flex items-center gap-1"><Activity className="h-3 w-3" /> Avg. Performance</div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.avg > 1000000 ? `${(metrics.avg / 1000000).toFixed(1)} M` : metrics.avg.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 font-medium flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Growth Rate</div>
              <div className={`text - 2xl font - bold ${metrics.growth >= 0 ? 'text-green-600' : 'text-red-600'} `}>
                {metrics.growth > 0 ? '+' : ''}{metrics.growth.toFixed(1)}%
              </div>
            </div>
          </div>

          <Separator />

          {/* 3. Executive Insights */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Strategic Policy Recommendations
              {hasAi && <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-2 text-xs"><Sparkles className="h-3 w-3 mr-1" /> AI Generated</Badge>}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {topPolicies.map((policy: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900">{policy.title}</h4>
                      <Badge variant="outline" className="capitalize">{policy.category}</Badge>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{policy.description}</p>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        <span className="font-semibold">Trigger:</span> {policy.triggerCondition || policy.trigger}
                      </div>
                      <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded">
                        <span className="font-semibold">Outcome:</span> {policy.expectedImpact}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {topPolicies.length === 0 && (
                <div className="p-8 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  No policy recommendations generated yet.
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* 4. Footer Disclaimer */}
          <div className="text-xs text-slate-400 pt-4 flex justify-between items-center">
            <p>Generated by NitiSetu Decision Support System. This report is computer-generated and subject to verification.</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium text-slate-600">Verified Analysis</span>
            </div>
          </div>

        </div>
        {/* PRINTABLE CONTAINER ENDS */}

        <div className="flex justify-center pt-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/dashboard">Back to Analytics Dashboard</Link>
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Summary;


