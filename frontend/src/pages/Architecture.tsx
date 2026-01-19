import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Shield, Database, TrendingUp, Lightbulb, Server, CheckCircle2 } from 'lucide-react';

export const Architecture: React.FC = () => (
  <DashboardLayout>
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">System Architecture</h1>
        <p className="text-muted-foreground">Transparent, explainable design principles</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Why No Black-Box AI?</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Government decision-making requires <strong>accountability and transparency</strong>. Every prediction and recommendation in this system can be traced back to clear logic:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Linear regression with visible R² scores</li>
            <li>Rule-based policies with explicit trigger conditions</li>
            <li>No neural networks or unexplainable models</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" />Data Processing</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            CSV ingestion with automatic schema detection. Validates time, region, and metric columns. Classifies as TIME_SERIES or SNAPSHOT.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Analytics Engine</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Statistical summaries, moving averages, and growth rate calculations. All computations are standard and auditable.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Server className="h-4 w-4" />Prediction Module</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Linear regression only. Requires minimum 6 data points. Shows R² score and confidence intervals. No deep learning.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4" />Policy Engine</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Rule-based recommendations. Each policy shows trigger condition, expected impact, and confidence level based on data quality.
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm"><strong>Cloud Agnostic:</strong> This system can run on any infrastructure without vendor lock-in.</p>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default Architecture;
