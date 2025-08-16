"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileText, Activity, Brain, MessageSquare } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import Link from "next/link";

// Extended mock data matching your existing structure
const mockInterviews = [
  {
    id: "int-123",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    jobTitle: "Software Engineer",
    startedAt: "2023-06-23",
    overall: 88,
    status: "Passed",
    scores: {
      interview: 92,
      resume: 85,
      behavior: 88
    },
    cvMetrics: {
      eyeContactPct: 78,
      blinkRatePerMin: 12,
      headStability: 0.002,
      lean: "neutral",
      fidgetScore: 0.015
    },
    responses: [
      {
        question: "Tell me about yourself",
        transcript: "I'm a software engineer with 3 years of experience building web applications...",
        duration: 45,
        eyeContact: 82
      }
    ]
  },
  {
    id: "int-124",
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    jobTitle: "Product Manager",
    startedAt: "2023-06-24",
    overall: 72,
    status: "Failed",
    scores: {
      interview: 75,
      resume: 68,
      behavior: 73
    },
    cvMetrics: {
      eyeContactPct: 65,
      blinkRatePerMin: 8,
      headStability: 0.005,
      lean: "back",
      fidgetScore: 0.023
    },
    responses: []
  },
  {
    id: "int-125",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    jobTitle: "Software Engineer",
    startedAt: "2023-06-25",
    overall: 95,
    status: "Passed",
    scores: {
      interview: 98,
      resume: 92,
      behavior: 95
    },
    cvMetrics: {
      eyeContactPct: 85,
      blinkRatePerMin: 15,
      headStability: 0.001,
      lean: "neutral",
      fidgetScore: 0.008
    },
    responses: []
  }
];

export default function EnhancedDashboard() {
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  
  const interview = selectedInterview 
    ? mockInterviews.find(i => i.id === selectedInterview)
    : null;

  // Chart data for behavior metrics
  const behaviorChartData = interview ? [
    { name: 'Eye Contact', value: interview.cvMetrics.eyeContactPct },
    { name: 'Blink Rate', value: (interview.cvMetrics.blinkRatePerMin / 20) * 100 },
    { name: 'Head Stability', value: Math.max(0, 100 - interview.cvMetrics.headStability * 10000) },
    { name: 'Posture', value: interview.cvMetrics.lean === "neutral" ? 100 : 60 },
    { name: 'Fidget Score', value: Math.max(0, 100 - interview.cvMetrics.fidgetScore * 1000) }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Enhanced Interview Dashboard</h2>
        <p className="text-muted-foreground">AI-powered candidate evaluation with behavioral insights</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interview List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>
                Click on any interview to view detailed behavioral analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => setSelectedInterview(interview.id)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedInterview === interview.id ? "bg-muted border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{interview.name}</h3>
                        <p className="text-sm text-muted-foreground">{interview.email}</p>
                      </div>
                      <Badge variant={interview.status === "Passed" ? "default" : "destructive"}>
                        {interview.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{interview.jobTitle}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{interview.overall}%</span>
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/interview/${interview.id}/report`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview Details */}
        <div className="lg:col-span-2">
          {interview ? (
            <div className="space-y-6">
              
              {/* Score Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{interview.overall}%</div>
                    <Progress value={interview.overall} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interview</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{interview.scores.interview}%</div>
                    <Progress value={interview.scores.interview} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resume</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{interview.scores.resume}%</div>
                    <Progress value={interview.scores.resume} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Behavior</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{interview.scores.behavior}%</div>
                    <Progress value={interview.scores.behavior} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Behavior Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Behavioral Analysis</CardTitle>
                  <CardDescription>
                    Computer vision insights from the interview session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* Behavior Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Performance Metrics</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={behaviorChartData}>
                          <XAxis 
                            dataKey="name" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Raw Metrics */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Detailed Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Eye Contact</span>
                            <span className="font-medium">{interview.cvMetrics.eyeContactPct}%</span>
                          </div>
                          <Progress value={interview.cvMetrics.eyeContactPct} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Blink Rate</span>
                            <span className="font-medium">{interview.cvMetrics.blinkRatePerMin}/min</span>
                          </div>
                          <Progress value={Math.min((interview.cvMetrics.blinkRatePerMin / 25) * 100, 100)} className="h-2" />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Head Stability</span>
                          <Badge variant="outline">
                            {interview.cvMetrics.headStability < 0.01 ? "Excellent" : "Good"}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Posture</span>
                          <Badge variant="outline" className="capitalize">
                            {interview.cvMetrics.lean}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Fidgeting</span>
                          <Badge variant="outline">
                            {interview.cvMetrics.fidgetScore < 0.02 ? "Low" : "Moderate"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button asChild>
                  <Link href={`/interview/${interview.id}/report`}>
                    View Full Report
                  </Link>
                </Button>
                <Button variant="outline">
                  Forward to Team
                </Button>
                <Button variant="outline">
                  Send Feedback
                </Button>
              </div>

            </div>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">Select an Interview</h3>
                <p className="text-muted-foreground">
                  Choose an interview from the list to view detailed behavioral analytics
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}