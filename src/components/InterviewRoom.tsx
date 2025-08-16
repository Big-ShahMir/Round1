"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { loadCV, computeFrameFeatures, aggregate, type FrameStats } from "@/lib/cv";

export default function InterviewRoom() {
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

  const questions = [
    "Tell me about yourself and why you're interested in this role.",
    "Describe a challenging project you've worked on recently.",
    "How do you handle working under pressure or tight deadlines?",
    "What are your greatest strengths and how do they apply to this position?",
    "Where do you see yourself in 5 years?",
    "Do you have any questions for us?"
  ];

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
    setFeatures([]);
  };

  const stopRecording = async () => {
    if (!recorder) return;

    setIsRecording(false);
    
    try {
      const audioBlob = await recorder.stop();
      const cvSummary = aggregate(features);
      
      console.log("Audio blob:", audioBlob);
      console.log("CV summary:", cvSummary);
      
      // Move to next question or complete interview
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Interview complete - redirect to report
        router.push(`/interview/int-${Date.now()}/report`);
      }
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
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Round1 Interview</h1>
        <p className="text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video Panel */}
        <div className="space-y-4">
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
                  style={{ transform: 'scaleX(-1)' }}
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
  );
}