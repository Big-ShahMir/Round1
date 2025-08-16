"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Plus,
  FileText,
  Users,
  Eye,
  Download,
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data - replace with real data from your backend
const postedJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$120k - $150k",
    status: "active",
    applications: 45,
    passedScreening: 12
  },
  {
    id: 2,
    title: "Data Scientist",
    company: "DataFlow",
    location: "Remote",
    salary: "$100k - $130k",
    status: "active",
    applications: 32,
    passedScreening: 8
  }
]

const screenedCandidates = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Senior Frontend Developer",
    resumeScore: 8.7,
    interviewScore: 8.5,
    behaviorScore: 8.2,
    overallScore: 8.5,
    status: "passed",
    resumeUrl: "#"
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Data Scientist",
    resumeScore: 8.2,
    interviewScore: 8.8,
    behaviorScore: 8.0,
    overallScore: 8.3,
    status: "passed",
    resumeUrl: "#"
  }
]

export default function RecruiterPage() {
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    requirements: ""
  });

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle job submission logic here
    console.log("New job:", newJob);
    setShowJobForm(false);
    setNewJob({ title: "", company: "", location: "", salary: "", description: "", requirements: "" });
  };

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
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
              <p className="text-gray-600">Post jobs and review screened candidates</p>
            </div>
          </div>
          <Button onClick={() => setShowJobForm(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>Post New Job</span>
          </Button>
        </div>

        {/* Job Posting Form */}
        {showJobForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Post New Job</CardTitle>
              <CardDescription>Fill in the details for your new job opening</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      placeholder="e.g., Senior Frontend Developer"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newJob.company}
                      onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                      placeholder="e.g., TechCorp"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      placeholder="e.g., San Francisco, CA or Remote"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input
                      id="salary"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                      placeholder="e.g., $100k - $130k"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    placeholder="List the key skills, experience, and qualifications needed..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Post Job
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowJobForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posted Jobs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Posted Jobs</span>
            </CardTitle>
            <CardDescription>Manage your active job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {postedJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">
                        {job.applications} applications
                      </Badge>
                      <Badge variant="default" className="bg-blue-600">
                        {job.passedScreening} passed screening
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      View Candidates
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Screened Candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Screened Candidates</span>
            </CardTitle>
            <CardDescription>Candidates who passed AI screening - ready for your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {screenedCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    <p className="text-gray-600">{candidate.position}</p>
                    <div className="flex items-center space-x-4 mt-2">
                                           <div className="text-sm">
                       <span className="font-medium">Resume: </span>
                       <span className="text-blue-600">{candidate.resumeScore}/10</span>
                     </div>
                     <div className="text-sm">
                       <span className="font-medium">Interview: </span>
                       <span className="text-blue-600">{candidate.interviewScore}/10</span>
                     </div>
                     <div className="text-sm">
                       <span className="font-medium">Behavior: </span>
                       <span className="text-blue-600">{candidate.behaviorScore}/10</span>
                     </div>
                     <div className="text-sm">
                       <span className="font-medium">Overall: </span>
                       <span className="text-blue-600 font-semibold">{candidate.overallScore}/10</span>
                     </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      <Link href={candidate.resumeUrl}>Resume</Link>
                    </Button>
                                         <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
