import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logo */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Round1</h1>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Round1</h1>
            <p className="text-xl text-gray-600">AI-Powered Interview Platform</p>
            <p className="text-lg text-gray-500 mt-2">Choose your role to get started</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recruiter View */}
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
              <CardHeader className="text-center">
                <Building2 className="h-20 w-20 mx-auto text-blue-600 mb-4" />
                <CardTitle className="text-3xl">I'm a Recruiter</CardTitle>
                <CardDescription className="text-lg">
                  Post jobs and review AI-screened candidates
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Post and manage job openings</p>
                  <p>• Review candidates who passed AI screening</p>
                  <p>• Access candidate details and resumes</p>
                  <p>• Make hiring decisions</p>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href="/recruiter">Continue as Recruiter</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Interviewee View */}
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-300">
              <CardHeader className="text-center">
                <GraduationCap className="h-20 w-20 mx-auto text-green-600 mb-4" />
                <CardTitle className="text-3xl">I'm an Interviewee</CardTitle>
                <CardDescription className="text-lg">
                  Browse jobs and take AI interviews
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Browse available job positions</p>
                  <p>• Take AI-powered screening interviews</p>
                  <p>• Get graded on resume and behavior</p>
                  <p>• Pass screening to reach recruiters</p>
                </div>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/interviewee">Continue as Interviewee</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
