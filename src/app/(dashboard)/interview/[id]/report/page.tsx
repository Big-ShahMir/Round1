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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { InterviewService } from "@/lib/interview-service"
import { useInterviewStorage } from "@/hooks/use-interview-storage"

export default function ReportPage({ params }: { params: { id: string } }) {
  const { interviewState, loading } = useInterviewStorage(params.id);
  const [score, setScore] = useState<any>(null);
  const [behaviorMetrics, setBehaviorMetrics] = useState<any>(null);
  const [behaviorData, setBehaviorData] = useState<any[]>([]);

  useEffect(() => {
    if (interviewState && interviewState.score) {
      setScore(interviewState.score);
      
      // Set behavioral metrics from the interview state
      const behavior = interviewState.behaviorSignals;
      setBehaviorMetrics({
        eyeContactPct: behavior.attentionScoreAvg,
        blinkRatePerMin: behavior.blinkRatePerMin || 0,
        headStability: behavior.headStability || 0,
        lean: behavior.lean || 'neutral',
        fidgetScore: behavior.fidgetScore || 0,
        attentionScore: behavior.attentionScoreAvg,
        behaviorScore: behavior.behaviorScore || 0
      });

      // Create behavioral data for charts
      setBehaviorData([
        { name: 'Eye Contact', value: behavior.attentionScoreAvg },
        { name: 'Blink Rate', value: Math.min((behavior.blinkRatePerMin || 0) / 20 * 100, 100) },
        { name: 'Stability', value: Math.max(0, 100 - (behavior.headStability || 0) * 10000) },
        { name: 'Posture', value: behavior.lean === "neutral" ? 100 : 70 },
        { name: 'Behavior Score', value: behavior.behaviorScore || 0 }
      ]);
    }
  }, [interviewState]);

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
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={behaviorData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
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
        </div>
      </div>
    </div>
  )
}
