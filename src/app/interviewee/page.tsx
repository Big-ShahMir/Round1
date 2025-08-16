"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  GraduationCap,
  Search,
  FileText,
  MapPin,
  Building2,
  DollarSign,
  Play,
  ArrowLeft,
  Filter,
  Briefcase,
  Clock,
  Users
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data - replace with real data from your backend
const availableJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$120k - $150k",
    type: "Full-time",
    posted: "2 days ago",
    applications: 45,
    description: "We're looking for a talented Frontend Developer to join our team and help build amazing user experiences.",
    requirements: ["React", "TypeScript", "5+ years experience", "UI/UX skills"]
  },
  {
    id: 2,
    title: "Data Scientist",
    company: "DataFlow",
    location: "Remote",
    salary: "$100k - $130k",
    type: "Full-time",
    posted: "1 week ago",
    applications: 32,
    description: "Join our data science team to develop machine learning models and drive business insights.",
    requirements: ["Python", "Machine Learning", "Statistics", "3+ years experience"]
  },
  {
    id: 3,
    title: "Product Manager",
    company: "InnovateLab",
    location: "New York, NY",
    salary: "$130k - $160k",
    type: "Full-time",
    posted: "3 days ago",
    applications: 28,
    description: "Lead product strategy and development for our innovative SaaS platform.",
    requirements: ["Product Strategy", "Agile", "User Research", "4+ years experience"]
  }
]

export default function IntervieweePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
    resumeFile: null as File | null
  });

  const filteredJobs = availableJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle resume submission logic here
    console.log("Resume data:", resumeData);
    setShowResumeForm(false);
    // Redirect to interview
    window.location.href = `/interview/${selectedJob.id}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeData({...resumeData, resumeFile: e.target.files[0]});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header with Logo */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 text-green-600">
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
              <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
              <p className="text-gray-600">Browse jobs and start your interview process</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs by title, company, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resume Form Modal */}
        {showResumeForm && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Apply for {selectedJob.title}</CardTitle>
                <CardDescription>
                  Please provide your information and resume to start the interview process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={resumeData.name}
                        onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.email}
                        onChange={(e) => setResumeData({...resumeData, email: e.target.value})}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={resumeData.phone}
                      onChange={(e) => setResumeData({...resumeData, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      value={resumeData.experience}
                      onChange={(e) => setResumeData({...resumeData, experience: e.target.value})}
                      placeholder="e.g., 5 years"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Key Skills</Label>
                    <Textarea
                      id="skills"
                      value={resumeData.skills}
                      onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
                      placeholder="List your key technical skills and competencies..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume (PDF)</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Upload your resume to get started with the interview process
                    </p>
                  </div>

                  <div className="flex space-x-2 pt-4">
                                         <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                      <Play className="mr-2 h-4 w-4" />
                      Start Interview
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowResumeForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
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
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        {job.posted}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{job.description}</p>
                    
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Key Requirements:</Label>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        {job.applications} applications
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                                         <Button 
                       onClick={() => {
                         setSelectedJob(job);
                         setShowResumeForm(true);
                       }}
                       className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                     >
                      <FileText className="h-4 w-4" />
                      <span>Apply & Interview</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
