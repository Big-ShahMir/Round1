"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Camera, CameraOff, ArrowLeft } from "lucide-react";
import { loadCV, computeFrameFeatures, aggregate, type FrameStats } from "@/lib/cv";

interface JobDetails {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string;
}

interface InterviewRoomProps {
  questions: string[];
  jobDetails: JobDetails;
  onComplete: () => void;
  onBack: () => void;
}

export default function InterviewRoom({ questions, jobDetails, onComplete, onBack }: InterviewRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [features, setFeatures] = useState<FrameStats[]>([]);
  const [cvModels, setCvModels] = useState<any>(null);
  const [recorder, setRecorder] = useState<any>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

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

  // CV feature extraction loop
  useEffect(() => {
    if (!cvModels || !videoRef.current) return;

    let frameId: number;
    const frames: FrameStats[] = [];

    const processFrame = () => {
      if (!videoRef.current || !isRecording) {
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
  }, [cvModels, isRecording]);

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

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Save the current answer and move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Interview completed
      setInterviewCompleted(true);
      onComplete();
    }
  };

  const goBack = () => {
    onBack();
  };

  // Calculate progress
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;
  
  // Get current features for display
  const currentFeatures = features.length > 0 ? features[features.length - 1] : null;

  if (interviewCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center border-slate-200 shadow-lg">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-2xl text-emerald-600">Interview Completed!</CardTitle>
                <CardDescription className="text-slate-600">
                  Thank you for completing your interview for {jobDetails.title} at {jobDetails.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-slate-700">
                    Your interview responses and behavior analysis have been recorded. 
                    The hiring team will review your performance and get back to you soon.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={goBack} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Preparation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button onClick={goBack} variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Interview in Progress</h1>
                <p className="text-slate-600">
                  {jobDetails.title} at {jobDetails.company}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Question {currentQuestion + 1} of {questions.length}</p>
              <Progress value={progressPercent} className="w-32 h-2 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Camera Preview
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
                  </div>
                </CardContent>
              </Card>

              {/* Live CV Features */}
              {currentFeatures && (
                <Card>
                  <CardHeader>
                    <CardTitle>Live Behavior Signals</CardTitle>
                    <CardDescription>Real-time analysis during your response</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Eye Contact:</span>
                          <span className="font-medium">{currentFeatures.eyeContactPct.toFixed(0)}%</span>
                        </div>
                        <Progress value={currentFeatures.eyeContactPct} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Blink Rate:</span>
                          <span className="font-medium">{currentFeatures.blinkRatePerMin.toFixed(0)}/min</span>
                        </div>
                        <Progress value={Math.min((currentFeatures.blinkRatePerMin / 25) * 100, 100)} className="h-2" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posture:</span>
                        <Badge variant="outline" className="capitalize">{currentFeatures.lean}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{currentFeatures.durSec.toFixed(0)}s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Question Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question {currentQuestion + 1}</CardTitle>
                  <CardDescription>Take your time to provide a thoughtful response</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">
                    {questions[currentQuestion]}
                  </p>
                </CardContent>
              </Card>

              {/* Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Recording Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={!cvModels}
                      size="lg"
                      className="w-full"
                    >
                      {cvModels ? "Start Answer" : "Loading CV Models..."}
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      size="lg"
                      className="w-full"
                    >
                      Stop Answer
                    </Button>
                  )}

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{currentQuestion + 1} / {questions.length}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  {currentQuestion === questions.length - 1 && !isRecording && (
                    <p className="text-sm text-muted-foreground text-center">
                      This is the final question. You'll see your results after completion.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}