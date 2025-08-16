"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Printer, AlertCircle, CheckCircle, Lightbulb } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const score = {
  overall: 88,
  pass: true,
  summary: "The candidate provided strong, detailed examples from their experience, particularly regarding the real-time data pipeline project. They demonstrated solid technical knowledge in Kafka, Flink, and monitoring tools. Communication was clear and concise. They appear to be a strong fit for the role.",
  skillHighlights: ["Kafka", "Apache Flink", "Real-time Processing", "System Monitoring", "Problem Solving"],
  concerns: ["Limited experience with GraphQL, which is mentioned in the job description."],
  redFlags: [],
  biasCheck: { flagged: false, notes: "No bias detected." },
  scores: {
    interview: 92,
    resume: 85,
    behavior: 80,
  }
}

const behaviorMetrics = {
  eyeContactPct: 78,
  blinkRatePerMin: 12,
  headStability: 0.002,
  lean: "neutral",
  fidgetScore: 0.015,
  attentionScore: 85
};

const behaviorData = [
  { name: '0-1m', value: 95 },
  { name: '1-2m', value: 90 },
  { name: '2-3m', value: 98 },
  { name: '3-4m', value: 85 },
  { name: '4-5m', value: 91 },
  { name: 'Eye Contact', value: behaviorMetrics.eyeContactPct },
  { name: 'Attention', value: behaviorMetrics.attentionScore },
  { name: 'Stability', value: Math.max(0, 100 - behaviorMetrics.headStability * 10000) },
  { name: 'Engagement', value: behaviorMetrics.lean === "neutral" ? 100 : 70 },
]

const transcript = [
  { speaker: "agent", text: "Thanks for your interest in the Software Engineer role. To start, can you tell me about a challenging project you've worked on and how you approached it?" },
  { speaker: "candidate", text: "Of course. One of the most challenging projects was building a real-time data processing pipeline. We had to handle millions of events per second with low latency. My approach was to use a combination of Kafka for message queuing and Apache Flink for stream processing. We also implemented a robust monitoring and alerting system using Prometheus and Grafana to ensure reliability." },
  { speaker: "agent", text: "That sounds impressive. Could you elaborate on the monitoring system? What specific metrics did you track?" },
];

export default function ReportPage({ params }: { params: { id: string } }) {
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

        {Object.entries(score.scores).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">{key} Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}%</div>
              <Progress value={value} className="mt-2 h-2" />
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
                {score.skillHighlights.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="text-destructive" /> Concerns</h4>
              {score.concerns.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {score.concerns.map((c, i) => <li key={i}>{c}</li>)}
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
                  {transcript.map((msg, index) => (
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
