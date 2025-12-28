import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertTriangle, Shield, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIAnalysisProps {
  emergencyDescription?: string;
  emergencyType: string;
  hospitalName: string;
  hospitalSpecializations: string[];
  queueLength: number;
  distance: number;
}

interface Analysis {
  severity: 'Critical' | 'Urgent' | 'Standard';
  recommendation: string;
  advice: string;
}

export function AIAnalysis({
  emergencyDescription,
  emergencyType,
  hospitalName,
  hospitalSpecializations,
  queueLength,
  distance
}: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const fetchAnalysis = async () => {
    if (hasAnalyzed) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-emergency', {
        body: {
          emergencyDescription,
          emergencyType,
          hospitalName,
          hospitalSpecializations,
          queueLength,
          distance
        }
      });

      if (error) throw error;
      
      if (data?.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      // Use fallback
      setAnalysis({
        severity: 'Standard',
        recommendation: `${hospitalName} is recommended based on proximity and current availability.`,
        advice: 'Stay calm and proceed safely to the hospital.'
      });
    } finally {
      setIsLoading(false);
      setHasAnalyzed(true);
    }
  };

  // Trigger analysis on mount
  useState(() => {
    fetchAnalysis();
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-4 h-4" />;
      case 'Urgent': return <Shield className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'Urgent': return 'bg-warning text-warning-foreground';
      default: return 'bg-success text-success-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">AI analyzing emergency...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className={getSeverityColor(analysis.severity)}>
            {getSeverityIcon(analysis.severity)}
            <span className="ml-1">{analysis.severity}</span>
          </Badge>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Why this hospital:</p>
          <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Safety advice:</p>
          <p className="text-sm text-muted-foreground">{analysis.advice}</p>
        </div>
      </CardContent>
    </Card>
  );
}
