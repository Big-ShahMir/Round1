"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import {
  Building2,
  MapPin,
  DollarSign,
  User,
  ArrowLeft,
  Play,
  CheckCircle,
  FileText,
  Upload,
  File,
  X,
} from "lucide-react";
import Link from "next/link";
import InterviewRoom from "@/components/InterviewRoom";

interface JobDetails {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string;
}

interface ResumeData {
  file: File | null;
  fileName: string;
  fileSize: number;
  uploadTime: Date | null;
}

function InterviewPageContent() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract job details from URL parameters
  const jobDetails: JobDetails = {
    title: searchParams.get("jobTitle") || "Software Engineer",
    company: searchParams.get("company") || "Tech Company",
    location: searchParams.get("location") || "Remote",
    salary: searchParams.get("salary") || "$80,000 - $120,000",
    description: searchParams.get("description") || "We are looking for a talented software engineer...",
    requirements: searchParams.get("requirements") || "JavaScript, React, Node.js",
  };

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    file: null,
    fileName: "",
    fileSize: 0,
    uploadTime: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  // Generate job-specific interview questions based on the job details
  const generateJobSpecificQuestions = (): string[] => {
    const baseQuestions = [
      "Tell me about yourself and your background.",
      "Why are you interested in this position?",
      "What are your greatest strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "Why should we hire you?",
      "Tell me about a challenging project you worked on.",
      "How do you handle stress and pressure?",
      "Describe a time when you had to learn something new quickly.",
      "How do you stay updated with industry trends?",
      "What's your preferred work environment?",
    ];

    const requirements = jobDetails.requirements.toLowerCase();
    const jobTitle = jobDetails.title.toLowerCase();
    const specificQuestions: string[] = [];

    // Frontend/UI Development Questions
    if (requirements.includes("javascript") || requirements.includes("js") || jobTitle.includes("frontend") || jobTitle.includes("ui")) {
      specificQuestions.push(
        "Can you explain the difference between var, let, and const in JavaScript?",
        "How do you handle asynchronous operations in JavaScript?",
        "What are closures and how do you use them?",
        "How do you optimize website performance?",
        "What's your experience with responsive design?",
        "How do you handle cross-browser compatibility issues?"
      );
    }

    if (requirements.includes("react") || jobTitle.includes("react")) {
      specificQuestions.push(
        "What are React hooks and how do you use them?",
        "Can you explain the component lifecycle in React?",
        "How do you manage state in React applications?",
        "What's the difference between controlled and uncontrolled components?",
        "How do you handle side effects in React?",
        "What are React Context and when would you use them?"
      );
    }

    // Backend Development Questions
    if (requirements.includes("node.js") || requirements.includes("nodejs") || jobTitle.includes("backend")) {
      specificQuestions.push(
        "What is the event loop in Node.js?",
        "How do you handle errors in Node.js applications?",
        "What are the benefits of using Node.js for backend development?",
        "How do you implement authentication and authorization?",
        "What's your experience with database design and optimization?",
        "How do you handle API rate limiting and security?"
      );
    }

    if (requirements.includes("python") || jobTitle.includes("python")) {
      specificQuestions.push(
        "What are Python decorators and how do you use them?",
        "How do you handle exceptions in Python?",
        "What's the difference between lists and tuples in Python?",
        "How do you work with virtual environments?",
        "What's your experience with Django or Flask?",
        "How do you handle memory management in Python?"
      );
    }

    if (requirements.includes("java") || jobTitle.includes("java")) {
      specificQuestions.push(
        "What is the difference between abstract classes and interfaces in Java?",
        "How does garbage collection work in Java?",
        "What are the main principles of object-oriented programming?",
        "How do you handle multithreading in Java?",
        "What's your experience with Spring framework?",
        "How do you implement design patterns in Java?"
      );
    }

    // DevOps/Infrastructure Questions
    if (jobTitle.includes("devops") || jobTitle.includes("infrastructure") || requirements.includes("docker") || requirements.includes("kubernetes")) {
      specificQuestions.push(
        "How do you approach CI/CD pipeline design?",
        "What's your experience with containerization?",
        "How do you monitor and troubleshoot production systems?",
        "What's your approach to infrastructure as code?",
        "How do you handle security in cloud environments?",
        "What's your experience with cloud platforms (AWS, Azure, GCP)?"
      );
    }

    // Data Science/Machine Learning Questions
    if (
      jobTitle.includes("data") ||
      jobTitle.includes("ml") ||
      jobTitle.includes("ai") ||
      requirements.includes("pandas") ||
      requirements.includes("tensorflow")
    ) {
      specificQuestions.push(
        "How do you handle missing data in datasets?",
        "What's your experience with data visualization?",
        "How do you evaluate machine learning models?",
        "What's your approach to feature engineering?",
        "How do you handle overfitting in ML models?",
        "What's your experience with big data technologies?"
      );
    }

    // Add questions based on job description keywords
    const description = jobDetails.description.toLowerCase();
    if (description.includes("team") || description.includes("collaboration")) {
      specificQuestions.push(
        "How do you handle conflicts within a team?",
        "Describe a time when you had to work with a difficult team member.",
        "What's your approach to mentoring junior developers?",
        "How do you ensure effective communication in a team?",
        "Describe a successful team project you led."
      );
    }

    if (description.includes("agile") || description.includes("scrum")) {
      specificQuestions.push(
        "How do you handle changing requirements in an agile environment?",
        "What's your experience with sprint planning and retrospectives?",
        "How do you estimate story points for user stories?",
        "How do you handle technical debt in agile development?",
        "What's your approach to daily standups?"
      );
    }

    if (description.includes("leadership") || description.includes("senior") || jobTitle.includes("senior") || jobTitle.includes("lead")) {
      specificQuestions.push(
        "How do you approach technical decision-making?",
        "Describe a time when you had to lead a technical team.",
        "How do you balance technical debt with new feature development?",
        "How do you handle disagreements with stakeholders?",
        "What's your approach to code reviews and team standards?",
        "How do you mentor and grow your team members?"
      );
    }

    if (description.includes("startup") || description.includes("fast-paced")) {
      specificQuestions.push(
        "How do you handle rapid changes and pivots?",
        "What's your experience working in a startup environment?",
        "How do you prioritize features with limited resources?",
        "How do you handle ambiguity and incomplete requirements?"
      );
    }

    if (description.includes("enterprise") || description.includes("large-scale")) {
      specificQuestions.push(
        "How do you handle complex legacy systems?",
        "What's your experience with enterprise architecture?",
        "How do you ensure compliance and security standards?",
        "How do you handle large-scale deployments?"
      );
    }

    if (jobDetails.company) {
      specificQuestions.push(
        `What interests you about working at ${jobDetails.company}?`,
        `How do you think your experience aligns with ${jobDetails.company}'s mission?`,
        `What do you know about ${jobDetails.company}'s products/services?`
      );
    }

    if (jobDetails.location && !jobDetails.location.toLowerCase().includes("remote")) {
      specificQuestions.push(
        `Are you comfortable with the location requirements for this position?`,
        `What are your thoughts on working in ${jobDetails.location}?`
      );
    }

    const allQuestions = [...baseQuestions, ...specificQuestions];
    const uniqueSeed = `${jobDetails.title}-${jobDetails.company}`.toLowerCase();
    const seedNumber = uniqueSeed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seedNumber + i) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const baseCount = Math.min(8, baseQuestions.length);
    const specificCount = Math.min(7, specificQuestions.length);

    return [...shuffled.slice(0, baseCount), ...shuffled.slice(baseQuestions.length, baseQuestions.length + specificCount)];
  };

  const [questions] = useState<string[]>(() => generateJobSpecificQuestions());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes("pdf") && !file.type.includes("doc") && !file.type.includes("docx")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setResumeData({
        file,
        fileName: file.name,
        fileSize: file.size,
        uploadTime: new Date(),
      });

      toast({
        title: "Resume uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });
    }
  };

  const removeResume = () => {
    setResumeData({
      file: null,
      fileName: "",
      fileSize: 0,
      uploadTime: null,
    });
  };

  const saveResumeToFirestore = async (): Promise<string | null> => {
    if (!resumeData.file || !currentUser?.uid) return null;

    try {
      // Convert file to base64 for storage
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(resumeData.file!);
      });

      // Use a different variable name to avoid shadowing
      const resumeDocData = {
        jobId: params.id,
        jobTitle: jobDetails.title,
        company: jobDetails.company,
        candidateId: currentUser.uid,
        candidateName: userProfile?.displayName || "",
        candidateEmail: userProfile?.email || "",
        fileName: resumeData.file.name,
        fileSize: resumeData.file.size,
        fileType: resumeData.file.type,
        fileData: base64Data,
        uploadedAt: Timestamp.now(),
        status: "pending_review",
      };

      const docRef = await addDoc(collection(db, "resumes"), resumeDocData);
      return docRef.id;
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const startInterview = async () => {
    if (!resumeData.file) {
      toast({
        title: "Resume required",
        description: "Please upload your resume before starting the interview.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const resumeId = await saveResumeToFirestore();
      if (resumeId) {
        setInterviewStarted(true);
        toast({
          title: "Resume saved",
          description: "Your resume has been saved and interview is starting.",
        });
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInterviewComplete = () => {
    setInterviewCompleted(true);
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setInterviewCompleted(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (interviewCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/interviewee" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Interview Completed!</h1>
              <p className="text-slate-600">Thank you for completing your interview</p>
            </div>
          </div>

          <Card className="mb-8 max-w-2xl mx-auto border-slate-200 shadow-lg">
            <CardHeader className="text-center bg-slate-50 border-b border-slate-200">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl text-emerald-600">Interview Successfully Completed</CardTitle>
              <CardDescription className="text-slate-600">Your responses have been recorded and saved</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 pt-6">
              <div className="space-y-2">
                <p className="text-lg font-medium text-slate-900">{jobDetails.title}</p>
                <p className="text-indigo-600">{jobDetails.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                  <p className="font-medium">Questions Answered</p>
                  <p>{questions.length}</p>
                </div>
                <div>
                  <p className="font-medium">Completion Date</p>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-slate-600 mb-4">
                  The hiring team will review your responses and resume. You will be contacted soon.
                </p>

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={resetInterview}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Practice Again
                  </Button>
                  <Link href="/interviewee">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Back to Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (interviewStarted) {
    return (
      <InterviewRoom
        questions={questions}
        jobDetails={jobDetails}
        onComplete={handleInterviewComplete}
        onBack={() => setInterviewStarted(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/interviewee" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Interview Preparation</h1>
            <p className="text-slate-600">Get ready for your interview</p>
          </div>
        </div>

        <Card className="mb-8 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span>Position Details</span>
            </CardTitle>
            <CardDescription className="text-slate-600">Review the job details before starting your interview</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{jobDetails.title}</h3>
                <p className="text-lg text-indigo-600 font-medium">{jobDetails.company}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span>{jobDetails.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <DollarSign className="h-4 w-4 text-indigo-500" />
                  <span>{jobDetails.salary}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span>Full-time</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Job Description</h4>
                <p className="text-slate-700 text-sm">{jobDetails.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {jobDetails.requirements.split(",").map((req, index) => (
                    <Badge key={index} variant="outline" className="border-slate-300 text-slate-700">
                      {req.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <File className="h-5 w-5 text-indigo-600" />
              <span>Resume Upload</span>
            </CardTitle>
            <CardDescription className="text-slate-600">Upload your resume for this job application</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!resumeData.file ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload" className="text-lg font-medium text-slate-700 cursor-pointer">
                      Click to upload resume
                    </Label>
                    <p className="text-sm text-slate-500">PDF, DOC, or DOCX files up to 5MB</p>
                  </div>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => document.getElementById("resume-upload")?.click()}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-indigo-500" />
                    <div>
                      <p className="font-medium text-slate-900">{resumeData.fileName}</p>
                      <p className="text-sm text-slate-600">
                        {formatFileSize(resumeData.fileSize)} • {resumeData.uploadTime?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={removeResume}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => document.getElementById("resume-upload")?.click()}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change File
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-900">Interview Instructions</CardTitle>
            <CardDescription className="text-slate-600">What to expect during your interview</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-slate-700">
              <p>• This interview will consist of {questions.length} questions</p>
              <p>• You will be recorded using your camera and microphone</p>
              <p>• Take your time to think before answering</p>
              <p>• You can pause and resume the interview at any time</p>
              <p>• Be honest and authentic in your responses</p>
              <p>• Your resume will be reviewed along with your interview responses</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={startInterview}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 shadow-lg"
            disabled={!resumeData.file || isUploading}
          >
            <Play className="mr-2 h-5 w-5" />
            {isUploading ? "Preparing Interview..." : "Start Interview"}
          </Button>
          {!resumeData.file && (
            <p className="text-sm text-slate-500 mt-2">Please upload your resume to start the interview</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <ProtectedRoute requiredRole="interviewee">
      <InterviewPageContent />
    </ProtectedRoute>
  );
}