"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Calendar, FileText, BarChart3, Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

interface InterviewData {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  questions: string[];
  answers: string[];
  behavioralData: any;
  behavioralScore: number;
  completedAt: any;
  status: string;
  duration: number;
}

export default function InterviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInterviewDetails(params.id as string);
    }
  }, [params.id]);

  const fetchInterviewDetails = async (interviewId: string) => {
    try {
      const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
      if (interviewDoc.exists()) {
        setInterview({ id: interviewDoc.id, ...interviewDoc.data() } as InterviewData);
      } else {
        toast({
          title: "Error",
          description: "Interview not found.",
          variant: "destructive",
        });
        router.push('/recruiter');
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch interview details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Interview not found.</p>
          <Link href="/recruiter">
            <Button className="mt-4">Back to Recruiter Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/recruiter" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Interview Details</h1>
            <p className="text-slate-600">Review candidate performance and responses</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Info & Scores */}
          <div className="lg:col-span-1 space-y-6">
            {/* Candidate Information */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <User className="h-5 w-5 text-indigo-600" />
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{interview.candidateName}</h3>
                    <p className="text-slate-600">{interview.candidateEmail}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Position:</span>
                      <span className="font-medium">{interview.jobTitle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Company:</span>
                      <span className="font-medium">{interview.company}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Completed:</span>
                      <span className="font-medium">
                        {interview.completedAt?.toDate?.() ? 
                          interview.completedAt.toDate().toLocaleDateString() : 
                          'Recently'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-medium">
                        {interview.duration ? Math.round(interview.duration / 60) : 0} minutes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavioral Score */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Behavioral Score
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(interview.behavioralScore)}`}>
                    {interview.behavioralScore}/100
                  </div>
                  <Badge 
                    variant={getScoreVariant(interview.behavioralScore)}
                    className="mb-4"
                  >
                    {interview.behavioralScore >= 80 ? 'Excellent' : 
                     interview.behavioralScore >= 60 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                  <Progress value={interview.behavioralScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Behavioral Analysis */}
            {interview.behavioralData && (
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Eye className="h-5 w-5 text-indigo-600" />
                    Behavioral Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Eye Contact</span>
                        <span className="font-medium">{interview.behavioralData.eyeContactPct?.toFixed(0) || 0}%</span>
                      </div>
                      <Progress value={interview.behavioralData.eyeContactPct || 0} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Posture</span>
                        <Badge variant="outline" className="capitalize">
                          {interview.behavioralData.lean || 'neutral'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Blink Rate</span>
                        <span className="font-medium">{interview.behavioralData.blinkRatePerMin?.toFixed(0) || 0}/min</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Head Stability</span>
                        <span className="font-medium">
                          {interview.behavioralData.headStability ? 
                            Math.round((1 - interview.behavioralData.headStability * 1000) * 100) : 0
                          }%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Questions & Answers */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Interview Responses
                  <Badge variant="outline" className="border-slate-300 text-slate-700">
                    {interview.questions?.length || 0} questions
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Review candidate responses to each interview question
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {interview.questions?.map((question, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-2">Question {index + 1}</h4>
                          <p className="text-slate-700 text-sm leading-relaxed">{question}</p>
                        </div>
                      </div>
                      
                      <div className="ml-9">
                        <h5 className="font-medium text-slate-800 mb-2">Candidate Response:</h5>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-slate-700 text-sm">
                            {interview.answers?.[index] || 'No response recorded'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <XCircle className="mr-2 h-4 w-4" />
            Reject Candidate
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            Move to Next Round
          </Button>
        </div>
      </div>
    </div>
  );
}
