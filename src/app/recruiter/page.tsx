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
  Calendar,
  LogOut,
  User,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, addDoc, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from '@/hooks/use-toast'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  status: 'active' | 'inactive';
  description: string;
  requirements: string;
  applications: number;
  passedScreening: number;
  createdAt: Timestamp;
  recruiterId: string;
}

interface ScreenedCandidate {
  id: string;
  name: string;
  position: string;
  resumeScore: number;
  interviewScore: number;
  behaviorScore: number;
  overallScore: number;
  status: 'passed' | 'failed';
  resumeUrl: string;
}

interface Interview {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  questions: string[];
  answers: string[];
  completedAt: any;
  status: string;
  behavioralScore?: number;
  behavioralData?: {
    eyeContactPct?: number;
    blinkRatePerMin?: number;
    lean?: string;
    headStability?: number;
  };
  duration?: number;
}

function RecruiterPageContent() {
  const { currentUser, userProfile, logout } = useAuth();
  const router = useRouter();
  const [showJobForm, setShowJobForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [screenedCandidates, setScreenedCandidates] = useState<ScreenedCandidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    requirements: ""
  });

  // Fetch posted jobs from Firestore
  useEffect(() => {
    if (currentUser && userProfile?.role === 'recruiter') {
      fetchPostedJobs();
      fetchInterviews();
    }
  }, [currentUser, userProfile]);

  const fetchPostedJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      // Simplified query without complex ordering to avoid index requirements
      const q = query(
        jobsRef,
        where('recruiterId', '==', userProfile?.uid)
        // Temporarily removed orderBy to avoid index requirements
      );
      
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      setPostedJobs(jobsData);
      console.log('Posted jobs fetched successfully:', jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posted jobs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchInterviews = async () => {
    try {
      const interviewsRef = collection(db, 'interviews');
      const q = query(
        interviewsRef,
        where('company', '==', userProfile?.company)
      );
      
      const querySnapshot = await getDocs(q);
      const interviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Interview[];
      
      setInterviews(interviewsData);
      console.log('Interviews fetched successfully:', interviewsData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch interviews. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const jobData = {
        ...newJob,
        status: 'active' as const,
        applications: 0,
        passedScreening: 0,
        createdAt: Timestamp.now(),
        recruiterId: currentUser?.uid,
        company: userProfile?.company || newJob.company
      };
      
      await addDoc(collection(db, 'jobs'), jobData);
      
      toast({
        title: "Success!",
        description: "Job posted successfully.",
      });
      
      setShowJobForm(false);
      setNewJob({ title: "", company: "", location: "", salary: "", description: "", requirements: "" });
      fetchPostedJobs(); // Refresh the jobs list
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Logo and User Info */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 text-indigo-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900">Round1</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4" />
              <span>{userProfile?.displayName}</span>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
                Recruiter
              </span>
              {userProfile?.company && (
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">
                  {userProfile.company}
                </span>
              )}
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <Button onClick={() => setShowJobForm(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
            Post New Job
          </Button>
        </div>

        {/* Job Posting Form */}
        {showJobForm && (
          <Card className="mb-8 border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-slate-900">Post New Job</CardTitle>
              <CardDescription className="text-slate-600">Fill in the details for your new job opening</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-700 font-medium">Job Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      placeholder="e.g., Senior Frontend Developer"
                      required
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700 font-medium">Company</Label>
                    <Input
                      id="company"
                      value={userProfile?.company || newJob.company}
                      onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                      placeholder="e.g., TechCorp"
                      required
                      disabled={!!userProfile?.company}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-700 font-medium">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      placeholder="e.g., San Francisco, CA or Remote"
                      required
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary" className="text-slate-700 font-medium">Salary Range</Label>
                    <Input
                      id="salary"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                      placeholder="e.g., $100k - $130k"
                      required
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Job Description</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    rows={4}
                    required
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-slate-700 font-medium">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    placeholder="List the key skills, experience, and qualifications needed..."
                    rows={3}
                    required
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm" disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowJobForm(false)}
                    disabled={isSubmitting}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posted Jobs */}
        <Card className="mb-8 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              <span>Posted Jobs</span>
            </CardTitle>
            <CardDescription className="text-slate-600">Manage your active job postings</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {postedJobs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No jobs posted yet. Create your first job posting to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {postedJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-indigo-500" />
                          {job.company}
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          {job.location}
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-indigo-500" />
                          {job.salary}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline" className="border-slate-300 text-slate-700">
                          {job.applications} applications
                        </Badge>
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                          {job.passedScreening} passed screening
                        </Badge>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className={job.status === 'active' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-500'}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        <Users className="mr-2 h-4 w-4" />
                        View Candidates
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(`/jobs/${job.id}`, '_blank')}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`/jobs/${job.id}/candidates`, '_blank')}>
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
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Users className="h-5 w-5 text-indigo-600" />
              <span>Completed Interviews</span>
              <Badge variant="outline" className="border-slate-300 text-slate-700">{interviews.length}</Badge>
            </CardTitle>
            <CardDescription className="text-slate-600">Review completed interviews from candidates</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {interviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No completed interviews yet. As candidates complete interviews, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">{interview.candidateName}</h3>
                          <p className="text-slate-600">{interview.jobTitle}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={interview.behavioralScore && interview.behavioralScore >= 80 ? 'default' : interview.behavioralScore && interview.behavioralScore >= 60 ? 'secondary' : 'destructive'}
                            className={interview.behavioralScore && interview.behavioralScore >= 80 ? 'bg-emerald-600' : interview.behavioralScore && interview.behavioralScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}
                          >
                            {interview.behavioralScore || 0}/100
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-indigo-500" />
                          {interview.candidateEmail}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          {interview.completedAt?.toDate?.() ? 
                            interview.completedAt.toDate().toLocaleDateString() : 
                            'Recently'
                          }
                        </span>
                        <span className="flex items-center space-x-1">
                          <FileText className="h-4 w-4 text-indigo-500" />
                          {interview.questions?.length || 0} questions
                        </span>
                        {interview.duration && (
                          <span className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4 text-indigo-500" />
                            {Math.round(interview.duration / 60)} min
                          </span>
                        )}
                      </div>

                      {/* Behavioral Analysis Summary */}
                      {interview.behavioralData && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Behavioral Analysis</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Eye Contact:</span>
                              <span className="font-medium">{interview.behavioralData.eyeContactPct?.toFixed(0) || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Posture:</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {interview.behavioralData.lean || 'neutral'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Blink Rate:</span>
                              <span className="font-medium">{interview.behavioralData.blinkRatePerMin?.toFixed(0) || 0}/min</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Stability:</span>
                              <span className="font-medium">{interview.behavioralData.headStability ? Math.round((1 - interview.behavioralData.headStability * 1000) * 100) : 0}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link href={`/recruiter/interview/${interview.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                        <Users className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(candidate.resumeUrl, '_blank')}>
                      <Download className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.open(`/candidates/${candidate.id}`, '_blank')}>
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

export default function RecruiterPage() {
  return (
    <ProtectedRoute requiredRole="recruiter">
      <RecruiterPageContent />
    </ProtectedRoute>
  );
}
