"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Printer, AlertCircle, CheckCircle, Lightbulb, Loader2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { InterviewService } from "@/lib/interview-service"

export default function ReportPage({ params }: { params: { id: string } }) {
  const [interviewState, setInterviewState] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [behaviorMetrics, setBehaviorMetrics] = useState<any>(null);
  const [behaviorData, setBehaviorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInterviewData = () => {
      try {
        // Load interview state from localStorage
        const storedInterview = localStorage.getItem(`interview-${params.id}`);
        const storedScore = localStorage.getItem(`interview_score_${params.id}`);
        const storedBehaviorData = localStorage.getItem(`behavior_data_${params.id}`);
        const storedFullAnalysis = localStorage.getItem(`full_analysis_${params.id}`);

        console.log('Loading interview data for ID:', params.id);
        console.log('Stored behavior data:', storedBehaviorData);

        if (storedInterview) {
          const parsedInterview = JSON.parse(storedInterview);
          setInterviewState(parsedInterview);
          console.log('Interview state loaded:', parsedInterview);
        }

        if (storedScore) {
          const parsedScore = JSON.parse(storedScore);
          setScore(parsedScore);
          console.log('Score data loaded:', parsedScore);
        }

        if (storedBehaviorData) {
          const parsedBehaviorData = JSON.parse(storedBehaviorData);
          console.log('Parsed behavior data:', parsedBehaviorData);
          
          const metrics = {
            eyeContactPct: parsedBehaviorData.scoringData?.attentionScoreAvg || 0,
            blinkRatePerMin: parsedBehaviorData.mediaAnalytics?.blinkRate || 0,
            headStability: parsedBehaviorData.mediaAnalytics?.headStability || 0,
            lean: parsedBehaviorData.mediaAnalytics?.posture || 'neutral',
            fidgetScore: parsedBehaviorData.mediaAnalytics?.fidgetScore || 0,
            attentionScore: parsedBehaviorData.scoringData?.attentionScoreAvg || 0,
            // Roboflow analytics
            professionalism: parsedBehaviorData.roboflowAnalytics?.professionalism || 0,
            engagement: parsedBehaviorData.roboflowAnalytics?.engagement || 0,
            alertness: parsedBehaviorData.roboflowAnalytics?.alertness || 0,
            confidence: parsedBehaviorData.roboflowAnalytics?.confidence || 0
          };
          
          setBehaviorMetrics(metrics);
          console.log('Behavior metrics set:', metrics);

          // Create behavioral data for charts with better data processing
          const chartData = [
            { name: 'Eye Contact', value: Math.max(1, Math.round(metrics.eyeContactPct)) },
            { name: 'Blink Rate', value: Math.max(1, Math.round(Math.min((metrics.blinkRatePerMin || 0) / 20 * 100, 100))) },
            { name: 'Posture', value: Math.max(1, metrics.lean === "neutral" ? 100 : 70) },
            { name: 'Professionalism', value: Math.max(1, Math.round(metrics.professionalism)) },
            { name: 'Engagement', value: Math.max(1, Math.round(metrics.engagement)) },
            { name: 'Alertness', value: Math.max(1, Math.round(metrics.alertness)) },
            { name: 'Confidence', value: Math.max(1, Math.round(metrics.confidence)) }
          ];
          
          setBehaviorData(chartData);
          console.log('Chart data set:', chartData);
        } else {
          console.warn('No behavioral data found for interview ID:', params.id);
          
          // Try to get basic behavioral data from interview state
          let fallbackMetrics = {
            eyeContactPct: 0,
            blinkRatePerMin: 0,
            headStability: 0,
            lean: 'neutral',
            fidgetScore: 0,
            attentionScore: 0,
            professionalism: 0,
            engagement: 0,
            alertness: 0,
            confidence: 0
          };
          
          if (storedInterview) {
            const parsedInterview = JSON.parse(storedInterview);
            if (parsedInterview.behaviorSignals) {
              fallbackMetrics = {
                eyeContactPct: parsedInterview.behaviorSignals.attentionScoreAvg || 0,
                blinkRatePerMin: parsedInterview.behaviorSignals.blinkRatePerMin || 0,
                headStability: parsedInterview.behaviorSignals.headStability || 0,
                lean: parsedInterview.behaviorSignals.lean || 'neutral',
                fidgetScore: parsedInterview.behaviorSignals.fidgetScore || 0,
                attentionScore: parsedInterview.behaviorSignals.attentionScoreAvg || 0,
                professionalism: 0, // Not available in basic signals
                engagement: 0, // Not available in basic signals
                alertness: 0, // Not available in basic signals
                confidence: 0 // Not available in basic signals
              };
              console.log('Using fallback behavioral data from interview state:', fallbackMetrics);
            }
          }
          
          setBehaviorMetrics(fallbackMetrics);
          setBehaviorData([
            { name: 'Eye Contact', value: Math.max(1, Math.round(fallbackMetrics.eyeContactPct)) },
            { name: 'Blink Rate', value: Math.max(1, Math.round(Math.min((fallbackMetrics.blinkRatePerMin || 0) / 20 * 100, 100))) },
            { name: 'Posture', value: Math.max(1, fallbackMetrics.lean === "neutral" ? 100 : 70) },
            { name: 'Professionalism', value: Math.max(1, Math.round(fallbackMetrics.professionalism)) },
            { name: 'Engagement', value: Math.max(1, Math.round(fallbackMetrics.engagement)) },
            { name: 'Alertness', value: Math.max(1, Math.round(fallbackMetrics.alertness)) },
            { name: 'Confidence', value: Math.max(1, Math.round(fallbackMetrics.confidence)) }
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to load interview data:', error);
        setLoading(false);
      }
    };

    loadInterviewData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading interview report...</span>
        </div>
      </div>
    );
  }

  if (!interviewState || !score) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Interview Not Found</h2>
          <p className="text-muted-foreground">The interview report could not be loaded.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Interview Report</h2>
          <p className="text-muted-foreground">Candidate: Olivia Martin</p>
        </div>
        <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print Report</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Badge variant={score.pass ? "default" : "destructive"}>{score.pass ? "Passed" : "Failed"}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">{score.overall}%</div>
            <p className="text-xs text-muted-foreground">Based on weighted average of all signals</p>
          </CardContent>
        </Card>

        {Object.entries(score.scores || {}).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">{key} Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value as number}%</div>
              <Progress value={value as number} className="mt-2 h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary & Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{score.summary}</p>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="text-accent" /> Skill Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {(score.skillHighlights || []).map((skill: string) => <Badge key={skill} variant="outline">{skill}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="text-destructive" /> Concerns</h4>
              {(score.concerns || []).length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {(score.concerns || []).map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No concerns identified.</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle /> Bias Check</h4>
              <p className="text-sm text-muted-foreground">{score.biasCheck.notes}</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Behavioral Insights
              </CardTitle>
              <CardDescription>Computer vision analysis during interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {behaviorData.length > 0 && behaviorData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={behaviorData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Score']}
                      labelFormatter={(label: any) => `${label}`}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm font-medium">No Behavioral Data Available</p>
                    <p className="text-xs">Behavioral tracking was not enabled during this interview</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eye Contact:</span>
                  <span className="font-medium">{behaviorMetrics.eyeContactPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blink Rate:</span>
                  <span className="font-medium">{behaviorMetrics.blinkRatePerMin}/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posture:</span>
                  <Badge variant="outline" className="capitalize">{behaviorMetrics.lean}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stability:</span>
                  <Badge variant="outline">
                    {behaviorMetrics.headStability < 0.01 ? "Excellent" : "Good"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Professionalism:</span>
                  <span className="font-medium">{behaviorMetrics.professionalism}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement:</span>
                  <span className="font-medium">{behaviorMetrics.engagement}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alertness:</span>
                  <span className="font-medium">{behaviorMetrics.alertness}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{behaviorMetrics.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-4 pr-4 text-sm">
                  {(interviewState.transcript || []).map((msg: any, index: number) => (
                    <div key={index}>
                      <p className="font-bold capitalize">{msg.speaker === 'agent' ? 'Interviewer' : 'You'}</p>
                      <p className="text-muted-foreground">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Debug Card - Remove in production */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-orange-700">
              <div className="space-y-2">
                <div><strong>Interview ID:</strong> {params.id}</div>
                <div><strong>Behavior Data Available:</strong> {behaviorData.length > 0 ? 'Yes' : 'No'}</div>
                <div><strong>Chart Data Points:</strong> {behaviorData.length}</div>
                <div><strong>Non-Zero Values:</strong> {behaviorData.filter(item => item.value > 0).length}</div>
                <div><strong>Eye Contact:</strong> {behaviorMetrics.eyeContactPct}%</div>
                <div><strong>Professionalism:</strong> {behaviorMetrics.professionalism}%</div>
                <div><strong>Engagement:</strong> {behaviorMetrics.engagement}%</div>
                <div><strong>Alertness:</strong> {behaviorMetrics.alertness}%</div>
                <div><strong>Confidence:</strong> {behaviorMetrics.confidence}%</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
