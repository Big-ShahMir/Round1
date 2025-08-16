"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Eye, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function InterviewCompletePage() {
  const params = useParams();
  const router = useRouter();
  const [jobDetails, setJobDetails] = useState<any>(null);

  useEffect(() => {
    // Get job details from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const jobTitle = urlParams.get('jobTitle') || 'Software Engineer';
    const company = urlParams.get('company') || 'Tech Company';
    
    setJobDetails({ title: jobTitle, company });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <Card className="text-center border-green-200 shadow-lg mb-8">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-800">Interview Completed!</CardTitle>
              <CardDescription className="text-green-700 text-lg">
                Congratulations on completing your interview
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {jobDetails?.title || 'Software Engineer'}
                  </h3>
                  <p className="text-lg text-indigo-600 font-medium">
                    {jobDetails?.company || 'Tech Company'}
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Your interview responses and behavioral analysis have been recorded and sent to the hiring team. 
                    They will review your performance and get back to you soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="mb-8 border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Eye className="h-5 w-5 text-indigo-600" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Review Process</h4>
                    <p className="text-sm text-slate-600">The hiring team will review your interview responses and behavioral analysis</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Evaluation</h4>
                    <p className="text-sm text-slate-600">Your performance will be evaluated against other candidates</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Decision</h4>
                    <p className="text-sm text-slate-600">You'll receive a decision within 1-2 weeks</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Next Steps</h4>
                    <p className="text-sm text-slate-600">If selected, you'll proceed to the next round or receive an offer</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/interviewee">
              <Button variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50">
                <ArrowRight className="mr-2 h-4 w-4" />
                Browse More Jobs
              </Button>
            </Link>
            
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Your Profile
            </Button>
          </div>

          {/* Recruiter Access Info */}
          <Card className="mt-8 border-indigo-200 bg-indigo-50">
            <CardHeader>
              <CardTitle className="text-indigo-800 text-lg">For Recruiters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-indigo-700 text-sm mb-3">
                Interview results are automatically saved and available in your recruiter dashboard. 
                You can review candidate responses, behavioral scores, and make hiring decisions.
              </p>
              <Link href="/recruiter">
                <Button variant="outline" size="sm" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                  Go to Recruiter Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
