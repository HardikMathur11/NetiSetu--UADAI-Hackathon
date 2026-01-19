import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Database,
  TrendingUp,
  LineChart,
  Lightbulb,
  Shield,
  CheckCircle2,
  Play,
  Upload,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { enrollmentTrendsData } from '@/data/demoData';

const workflowSteps = [
  {
    icon: Upload,
    title: 'Upload Data',
    description: 'Import UIDAI-style CSV datasets with automatic schema detection',
  },
  {
    icon: Database,
    title: 'Understand',
    description: 'Automatic column detection, statistics, and data quality assessment',
  },
  {
    icon: TrendingUp,
    title: 'Analyze',
    description: 'Trend analysis with moving averages and growth rate calculations',
  },
  {
    icon: LineChart,
    title: 'Predict',
    description: 'Explainable linear regression forecasts with confidence intervals',
  },
  {
    icon: Lightbulb,
    title: 'Recommend',
    description: 'Rule-based policy suggestions with clear triggering conditions',
  },
];

const features = [
  {
    title: 'No Black-Box AI',
    description: 'Every prediction and recommendation is explainable with clear logic',
    icon: Shield,
  },
  {
    title: 'Policy-Ready Insights',
    description: 'Recommendations written for government decision-makers, not technicians',
    icon: Lightbulb,
  },
  {
    title: 'Prediction Guardrails',
    description: 'System only predicts when statistically valid (≥6 data points)',
    icon: CheckCircle2,
  },
];

export const Landing: React.FC = () => {
  const { setCurrentDataset, setGuidedStep, setIsDemoMode } = useApp();

  const handleStartDemo = () => {
    setIsDemoMode(true);
    setCurrentDataset(enrollmentTrendsData);
    setGuidedStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-500/20">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-slate-50">
        {/* New Vivid Tech Background Image - Full Visibility */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100 mix-blend-normal"
          style={{ backgroundImage: "url('/landing-bg-vivid.png')" }}
        />

        {/* Minimal Gradient just for text protection on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/30 to-transparent z-0" />

        {/* Subtle animated blobs (optional, reduced intensity to blend with image) */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-sky-200/20 rounded-full blur-[100px] -z-0 animate-blob mix-blend-multiply" />

        <div className="container relative mx-auto px-6 z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text */}
          <div className="space-y-10 text-center lg:text-left pt-12 lg:pt-0">
            {/* Logic Badge */}
            <div className="flex justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-3 rounded-full text-xs font-bold tracking-widest uppercase">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
                UIDAI Data Hackathon 2026
              </Badge>
            </div>

            {/* Main Title */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[1.1] drop-shadow-sm">
                Niti<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-blue-700 animate-gradient-x bg-[length:200%_auto]">Setu</span>
              </h1>
              <p className="text-2xl md:text-3xl text-slate-800 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal tracking-tight drop-shadow-sm">
                Data-driven governance for the <span className="text-slate-900 font-bold underline decoration-orange-500 decoration-4 underline-offset-4">developed nation</span> of tomorrow.
              </p>
              <p className="text-lg text-slate-700 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed drop-shadow-sm">
                Connect raw UIDAI data to actionable policy decisions with our transparent, AI-powered analytics engine.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              <Button
                size="lg"
                className="h-16 px-10 text-lg rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/40 transition-all hover:scale-105 hover:-translate-y-1 border-0 ring-4 ring-slate-100/50"
                onClick={handleStartDemo}
                asChild
              >
                <Link to="/dashboard">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Explore Demo
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 text-lg rounded-full border-2 border-slate-300 bg-white/80 text-slate-800 backdrop-blur-md hover:bg-white hover:border-orange-500 hover:text-orange-700 transition-all hover:scale-105 hover:-translate-y-1 shadow-lg font-semibold"
                asChild
              >
                <Link to="/upload">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Dataset
                </Link>
              </Button>
            </div>

            {/* ... (Trust indicators skipped for brevity, keeping existing) ... */}
            <div className="pt-10 flex items-center justify-center lg:justify-start gap-12 border-t border-slate-300/50 mt-10">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-black text-slate-900 drop-shadow-sm">99.9%</div>
                <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Reliability</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-black text-slate-900 drop-shadow-sm">Real-time</div>
                <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Analytics</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-black text-slate-900 drop-shadow-sm">Secure</div>
                <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Infrastructure</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image/Illustration - IMPROVED VISIBILITY */}
          <div className="relative h-[500px] md:h-[600px] w-full animate-in fade-in zoom-in duration-1000 delay-300 perspective-1000">
            {/* Keeping the image part same as before */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-blue-600/20 to-orange-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />

            {/* Main Image Container */}
            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-8 border-white bg-slate-100 rotate-y-6 hover:rotate-0 transition-transform duration-700 ease-out preserve-3d">
              <img
                src="/hero-vivid.png"
                alt="Digital India Analytics Dashboard"
                className="object-cover w-full h-full scale-105 hover:scale-110 transition-transform duration-[1.5s]"
              />

              {/* Overlay Gradient for Text Contrast */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

              {/* Enhanced Floating Card */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/50 flex items-center gap-5 translate-z-10 animate-float">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-200">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Security Audit</div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">System Optimal</div>
                  <div className="text-xs text-green-600 font-medium">No vulnerabilities detected</div>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-700">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Problem Section - UPDATED BACKGROUND */}
      <section className="py-24 container mx-auto px-4 relative overflow-hidden bg-gradient-to-b from-slate-100 via-blue-50 to-slate-200">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4 relative z-10">
          <Badge variant="outline" className="mb-2 border-blue-200 bg-white/50 text-blue-700 px-4 py-1 backdrop-blur-sm">The Mission</Badge>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Governance 2.0</h2>
          <p className="text-xl text-slate-700 font-medium">
            Moving away from intuition-based decisions to <span className="text-blue-700 font-bold bg-white/50 px-1 rounded">evidence-based policymaking</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {features.map((feature, i) => (
            <Card key={feature.title} className="group relative overflow-hidden border-white/50 bg-white/80 backdrop-blur-md shadow-xl shadow-slate-300/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-200/50 ring-1 ring-slate-200/50">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <CardHeader>
                <div className="mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-100 shadow-inner">
                  <feature.icon className="h-7 w-7 text-blue-700" />
                </div>
                <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-700 font-medium">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Workflow Section - UPDATED BACKGROUND */}
      <section className="py-24 bg-[#F8FAFC] border-y border-slate-200 relative overflow-hidden">
        {/* Abstract Shapes Background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-slate-900">How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">NitiSetu</span> Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
              Transparent pipeline from raw data to actionable government policy
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-dashed border-t-2 border-slate-200 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="relative z-10 group">
                  <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 h-full shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-orange-400">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors shadow-inner border border-slate-200">
                        <step.icon className="h-7 w-7 text-slate-600 group-hover:text-orange-500 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900">{step.title}</h3>
                      <p className="text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                  {/* Mobile Arrow */}
                  {index < workflowSteps.length - 1 && (
                    <div className="md:hidden flex justify-center py-4 text-slate-300">
                      <ArrowRight className="h-6 w-6 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 container mx-auto px-4 text-center relative overflow-hidden bg-slate-900">
        {/* Abstract Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 to-blue-900 opacity-80" />

        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Ready to Transform?</h2>
          <p className="text-xl text-slate-300">
            Deploy NitiSetu in your department today and unlock the power of data.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-blue-900 hover:bg-blue-50 shadow-xl transition-all hover:scale-105 border-0 font-bold" onClick={handleStartDemo} asChild>
              <Link to="/dashboard">
                Launch NitiSetu <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-90">
            <span className="h-8 w-8 rounded bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">N</span>
            <span className="font-bold text-2xl tracking-tight text-slate-900">NitiSetu</span>
          </div>
          <p className="text-sm text-slate-500 mb-2">Developed for UIDAI Data Hackathon 2026</p>
          <div className="flex justify-center gap-4 mt-6">
            <span className="h-1 w-10 bg-orange-400 rounded-full"></span>
            <span className="h-1 w-10 bg-white border border-slate-200 rounded-full"></span>
            <span className="h-1 w-10 bg-green-500 rounded-full"></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
