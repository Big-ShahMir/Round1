"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Camera, CameraOff, Send, Loader2, BarChart2, CheckCircle } from "lucide-react";
import { loadCV, computeFrameFeatures, aggregate, type FrameStats } from "@/lib/cv";
import { InterviewService, type InterviewMessage } from "@/lib/interview-service";
import { cn } from "@/lib/utils";

export default function AIInterviewRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingStarted, setIsRecordingStarted] = useState(false);
  const [features, setFeatures] = useState<FrameStats[]>([]);
  const [cvModels, setCvModels] = useState<any>(null);
  const [recorder, setRecorder] = useState<any>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Interview state
  const [interviewService, setInterviewService] = useState<InterviewService | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionCategory, setQuestionCategory] = useState<string>("");
  const [shouldWrapUp, setShouldWrapUp] = useState(false);

  // Mock data - in a real app, this would come from the job posting and candidate profile
  const mockJobData = {
    description: "We are looking for a Software Engineer to join our team. You will be responsible for developing scalable web applications, working with modern technologies like React, Node.js, and cloud platforms.",
    skillsRequired: ["JavaScript", "React", "Node.js", "TypeScript", "AWS", "Git"],
  };

  const mockResume = {
    summary: "Experienced software engineer with 3+ years building web applications. Passionate about clean code and user experience.",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "Docker"],
    experience: [
      {
        title: "Software Engineer",
        company: "TechCorp",
        bullets: [
          "Built and maintained React-based web applications",
          "Implemented RESTful APIs using Node.js and Express",
          "Collaborated with cross-functional teams using Agile methodologies"
        ]
      }
    ]
  };

  // Initialize interview service
  useEffect(() => {
    const service = new InterviewService(
      mockJobData.description,
      mockJobData.skillsRequired,
      mockResume,
      5 // max depth
    );
    setInterviewService(service);
  }, []);

  // Initialize camera and CV models
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Load MediaPipe models
        const models = await loadCV();
        setCvModels(models);
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };
    init();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Generate first question when service is ready
  useEffect(() => {
    if (interviewService && messages.length === 0) {
      generateNextQuestion();
    }
  }, [interviewService]);

  // CV feature extraction loop
  useEffect(() => {
    if (!cvModels || !videoRef.current) return;

    let frameId: number;
    const frames: FrameStats[] = [];

    const processFrame = () => {
      if (!videoRef.current || !isRecordingStarted) {
        frameId = requestAnimationFrame(processFrame);
        return;
      }

      const video = videoRef.current;
      const timestamp = performance.now();

      try {
        const faceResults = cvModels.face.detectForVideo(video, timestamp);
        const poseResults = cvModels.pose.detectForVideo(video, timestamp);
        
        const frameStats = computeFrameFeatures(faceResults, poseResults);
        frames.push(frameStats);
        
        if (frames.length % 30 === 0) {
          setFeatures([...frames]);
        }
      } catch (error) {
        console.error("CV processing error:", error);
      }

      setTimeout(() => {
        frameId = requestAnimationFrame(processFrame);
      }, 100);
    };

    frameId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(frameId);
  }, [cvModels, isRecordingStarted]);

  const generateNextQuestion = async () => {
    if (!interviewService) return;

    setIsGeneratingQuestion(true);
    try {
      const question = await interviewService.generateNextQuestion();
      if (question) {
        setCurrentQuestion(question.question);
        setQuestionCategory(question.category);
        setShouldWrapUp(question.shouldWrapUp);
        setMessages(interviewService.getTranscript());
      } else {
        // Interview is complete
        await completeInterview();
      }
    } catch (error) {
      console.error("Failed to generate question:", error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const submitAnswer = async () => {
    if (!interviewService || !currentAnswer.trim() || interviewService.isInterviewComplete()) return;

    // Add candidate's answer to transcript
    interviewService.addMessage('candidate', currentAnswer.trim());
    setMessages(interviewService.getTranscript());
    setCurrentAnswer("");

    // Update behavior signals if we have CV data
    if (features.length > 0) {
      const cvSummary = aggregate(features);
      if (cvSummary) {
        interviewService.updateBehaviorSignals({
          attentionScoreAvg: cvSummary.eyeContactPct,
          speakingRatio: 50, // This would be calculated from audio analysis
          lookingAwayPctAvg: 100 - cvSummary.eyeContactPct,
          pausesCount: 0, // This would be calculated from audio analysis
        });
      }
    }

    // Save state after each interaction
    interviewService.saveToStorage();

    // Generate next question
    await generateNextQuestion();
  };

  const completeInterview = async () => {
    if (!interviewService) return;

    setIsCompleting(true);
    try {
      const score = await interviewService.completeInterview();
      const interviewId = interviewService.getState().id;
      
      // Save final state
      interviewService.saveToStorage();
      
      // Redirect to report page with the interview results
      router.push(`/interview/${interviewId}/report`);
    } catch (error) {
      console.error("Failed to complete interview:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const startBehavioralTracking = () => {
    setIsRecordingStarted(true);
    setFeatures([]);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const mediaRecorder = new MediaRecorder(audioStream, { 
      mimeType: "audio/webm" 
    });
    
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    setRecorder({
      recorder: mediaRecorder,
      stop: (): Promise<Blob> => new Promise(resolve => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: "audio/webm" }));
        };
        mediaRecorder.stop();
      })
    });

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!recorder) return;

    setIsRecording(false);
    
    try {
      const audioBlob = await recorder.stop();
      console.log("Audio recorded:", audioBlob);
      // Here you would typically send the audio to a speech-to-text service
      // For now, we'll just use the text input
      setRecorder(null);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const currentFeatures = features.length > 0 ? aggregate(features) : null;
  const isInterviewComplete = interviewService?.isInterviewComplete() || false;

  return (
    <div className="grid h-full min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Panel: Webcam and Signals */}
      <div className="flex flex-col gap-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-5 w-5" />
              Your Camera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-muted"
              />
              {isRecording && (
                <Badge className="absolute top-2 left-2 bg-destructive">
                  ● Recording
                </Badge>
              )}
              {isRecordingStarted && !isRecording && (
                <Badge className="absolute top-2 left-2 bg-blue-600">
                  ● Tracking
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-5 w-5" />
              Behavioral Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!isRecordingStarted ? (
              <div className="space-y-4">
                <div className="text-center text-muted-foreground">
                  Click "Start Tracking" to begin behavioral analysis
                </div>
                <Button 
                  onClick={startBehavioralTracking}
                  className="w-full"
                  disabled={!cvModels}
                >
                  {cvModels ? "Start Behavioral Tracking" : "Loading CV Models..."}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-green-600 text-sm font-medium mb-2">
                  ✓ Behavioral tracking active
                </div>
                {currentFeatures ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eye Contact</span>
                      <span className="font-medium">{currentFeatures.eyeContactPct.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blink Rate</span>
                      <span className="font-medium">{currentFeatures.blinkRatePerMin.toFixed(0)}/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posture</span>
                      <Badge variant="outline" className="capitalize">{currentFeatures.lean}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{currentFeatures.durSec.toFixed(0)}s</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Analyzing behavioral signals...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Panel: Interview Chat */}
      <Card className="flex flex-col lg:col-span-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Interview
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCamera}
                className={!cameraEnabled ? "bg-destructive text-destructive-foreground" : ""}
              >
                {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMic}
                className={!micEnabled ? "bg-destructive text-destructive-foreground" : ""}
              >
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
          {questionCategory && (
            <CardDescription>
              Question Category: <Badge variant="secondary">{questionCategory}</Badge>
              {shouldWrapUp && <Badge variant="destructive" className="ml-2">Final Question</Badge>}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex items-start gap-3", msg.speaker === 'candidate' && "flex-row-reverse")}>
                  <Avatar>
                    <AvatarImage src={msg.speaker === 'agent' ? undefined : "https://placehold.co/100x100.png"} alt={msg.speaker} />
                    <AvatarFallback>{msg.speaker === 'agent' ? 'AI' : 'ME'}</AvatarFallback>
                  </Avatar>
                  <div className={cn("max-w-sm rounded-lg p-3 sm:max-w-md", msg.speaker === 'agent' ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isGeneratingQuestion && (
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating next question...</span>
                    </div>
                  </div>
                </div>
              )}
              {isInterviewComplete && (
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">Interview completed! Your responses have been evaluated.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          {isInterviewComplete ? (
            <div className="text-center py-4">
              <div className="text-lg font-semibold text-green-600 mb-2">Interview Complete!</div>
              <div className="text-sm text-muted-foreground mb-4">
                Your interview has been completed and scored. You can view your results in the report.
              </div>
              <Button 
                onClick={() => {
                  const interviewId = interviewService?.getState().id;
                  if (interviewId) {
                    router.push(`/interview/${interviewId}/report`);
                  }
                }}
                className="w-full"
              >
                View Results
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                placeholder={isGeneratingQuestion ? "Generating next question..." : "Your answer..."}
                className="resize-none pr-24"
                rows={3}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
                disabled={isGeneratingQuestion}
              />
              <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
                {!isRecording ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={startRecording} 
                    aria-label="Record Audio"
                    disabled={isGeneratingQuestion}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={stopRecording} 
                    aria-label="Stop Recording"
                  >
                    <MicOff className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim() || isGeneratingQuestion}
                  aria-label="Send Message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Right Panel: Current Question */}
      <Card className="hidden flex-col lg:col-span-3 lg:flex">
        <CardHeader>
          <CardTitle className="text-base">
            {isInterviewComplete ? "Interview Summary" : "Current Question"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4">
              {isInterviewComplete ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">✓ Complete</div>
                    <p className="text-sm text-muted-foreground">
                      Your interview has been successfully completed and evaluated.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Total Questions:</span> {messages.filter(m => m.speaker === 'agent').length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Duration:</span> {messages.length > 0 ? 
                        Math.round((messages[messages.length - 1].timestamp.getTime() - messages[0].timestamp.getTime()) / 1000 / 60) : 0} minutes
                    </div>
                  </div>
                </div>
              ) : currentQuestion ? (
                <div>
                  <p className="text-sm leading-relaxed">{currentQuestion}</p>
                  {questionCategory && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Category:</p>
                      <Badge variant="outline">{questionCategory}</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  {isGeneratingQuestion ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating question...</span>
                    </div>
                  ) : (
                    "Waiting for question..."
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 