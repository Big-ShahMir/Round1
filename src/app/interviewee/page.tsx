"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building2,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  LogOut,
  User,
  ArrowLeft,
  Briefcase,
  Filter
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
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

function IntervieweePageContent() {
  const { currentUser, userProfile, logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Fetch available jobs from Firestore
  useEffect(() => {
    if (currentUser && userProfile?.role === 'interviewee') {
      fetchJobs();
    }
  }, [currentUser, userProfile]);

  // Filter jobs based on search and location
  useEffect(() => {
    let filtered = jobs;
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (locationFilter) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, locationFilter]);

  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      // Simplified query without complex ordering to avoid index requirements
      const q = query(
        jobsRef,
        where('status', '==', 'active')
        // Temporarily removed orderBy to avoid index requirements
      );
      
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      setJobs(jobsData);
      console.log('Jobs fetched successfully:', jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      });
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

  const handleApply = (job: Job) => {
    // Navigate to interview page with job details
    const interviewUrl = `/interview/${job.id}?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}&salary=${encodeURIComponent(job.salary)}&description=${encodeURIComponent(job.description)}&requirements=${encodeURIComponent(job.requirements)}`;
    router.push(interviewUrl);
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
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                Interviewee
              </span>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Job Opportunities</h1>
              <p className="text-slate-600">Browse available positions and apply for jobs</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Search className="h-5 w-5 text-indigo-600" />
              <span>Search Jobs</span>
            </CardTitle>
            <CardDescription className="text-slate-600">Find the perfect job opportunity for you</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-slate-700 font-medium">Search Jobs</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by title, company, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-700 font-medium">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Actions</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setLocationFilter('');
                    }}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    onClick={fetchJobs}
                    disabled={isLoadingJobs}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    {isLoadingJobs ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Jobs */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              <span>Available Jobs</span>
              <Badge variant="outline" className="border-slate-300 text-slate-700">{filteredJobs.length} positions</Badge>
            </CardTitle>
            <CardDescription className="text-slate-600">Browse and apply for open positions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingJobs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>
                  {jobs.length === 0 
                    ? "No jobs available at the moment. Check back later!" 
                    : "No jobs match your current filters. Try adjusting your search criteria."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="flex items-start justify-between p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-xl text-slate-900">{job.title}</h3>
                          <p className="text-lg text-indigo-600 font-medium">{job.company}</p>
                        </div>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className={job.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-500'}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-slate-600 mb-3">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          {job.location}
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-indigo-500" />
                          {job.salary}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          Posted {job.createdAt.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-slate-700 mb-3 line-clamp-2">{job.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-indigo-500" />
                          {job.applications} applications
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-indigo-500" />
                          {job.passedScreening} passed screening
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      <Button 
                        onClick={() => handleApply(job)}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                      >
                        Apply Now
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function IntervieweePage() {
  return (
    <ProtectedRoute requiredRole="interviewee">
      <IntervieweePageContent />
    </ProtectedRoute>
  );
}
