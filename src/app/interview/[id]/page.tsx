"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { loadCV, computeFrameFeatures, aggregate, type FrameStats } from "@/lib/cv";
import { initializeRoboflow, detectObjects, analyzeInterviewBehavior, combineAnalytics, type InterviewAnalytics, type RoboflowConfig } from "@/lib/roboflow";
import { Mic, Send, Webcam, BarChart2, Brain, AlertTriangle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const messages = [
  { sender: "agent", text: "Thanks for your interest in the Software Engineer role. To start, can you tell me about a challenging project you've worked on and how you approached it?" },
  { sender: "candidate", text: "Of course. One of the most challenging projects was building a real-time data processing pipeline. We had to handle millions of events per second with low latency. My approach was to use a combination of Kafka for message queuing and Apache Flink for stream processing. We also implemented a robust monitoring and alerting system using Prometheus and Grafana to ensure reliability." },
  { sender: "agent", text: "That sounds impressive. Could you elaborate on the monitoring system? What specific metrics did you track?" },
];

export default function InterviewPage({ params }: { params: { id: string } }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false);
  const [behaviorData, setBehaviorData] = useState({
    attentionScore: 0,
    speakingRatio: 0,
    lookingAway: 100,
    pauses: 0,
    eyeContact: 0,
    headStability: 0,
    blinkRate: 0,
    posture: "neutral" as "forward" | "neutral" | "back"
  });
  const [roboflowAnalytics, setRoboflowAnalytics] = useState<InterviewAnalytics>({
    professionalism: 0,
    engagement: 0,
    alertness: 0,
    confidence: 0,
    distractions: [],
    timestamp: 0
  });
  const [latestClassification, setLatestClassification] = useState<{
    class: string;
    confidence: number;
    timestamp: number;
  } | null>(null);
  const [isRoboflowLoaded, setIsRoboflowLoaded] = useState(false);
  const [roboflowReady, setRoboflowReady] = useState<any>(null);
  const [frames, setFrames] = useState<FrameStats[]>([]);
  const [cvModels, setCvModels] = useState<{ face: any; pose: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ frameCount: 0, fpsCount: 0, roboflowFps: 0 });
  const animationFrameRef = useRef<number>();
  const lastProcessTime = useRef<number>(0);
  const lastRoboflowTime = useRef<number>(0);
  const fpsCounter = useRef({ count: 0, lastTime: 0 });
  const roboflowCounter = useRef({ count: 0, lastTime: 0 });

  useEffect(() => {
    initializeCamera();
    loadMediaPipe();
    loadRoboflow();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up camera stream
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const loadMediaPipe = async () => {
    try {
      console.log("Starting MediaPipe load...");
      setIsProcessing(true);
      const models = await loadCV();
      setCvModels(models);
      setIsMediaPipeLoaded(true);
      console.log("MediaPipe models loaded successfully:", { face: !!models.face, pose: !!models.pose });
    } catch (error) {
      console.error("Failed to load MediaPipe:", error);
      setError(`Failed to load MediaPipe models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadRoboflow = async () => {
    try {
      console.log("Starting Roboflow load...");
      
      // Your Roboflow classification model configuration
      const config: RoboflowConfig = {
        apiKey: "n0zbBusTJ0qr8jlvi4DS",
        modelEndpoint: "https://classify.roboflow.com/interview-classification-m3qja/1",
        confidence: 0.5
      };
      
      const result = await initializeRoboflow(config);
      setRoboflowReady(result);
      setIsRoboflowLoaded(true);
      console.log("Roboflow initialized successfully:", result.demo ? 'Demo Mode' : 'API Mode');
    } catch (error) {
      console.warn("Roboflow not available:", error);
      // Roboflow is optional, continue without it
    }
  };

  const processFrame = () => {
    const now = performance.now();
    
    // Process at ~10fps
    if (now - lastProcessTime.current < 100) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    lastProcessTime.current = now;

    if (!videoRef.current || !cvModels || !isMediaPipeLoaded) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const timestamp = performance.now();
      
      // Process with MediaPipe
      const faceResult = cvModels.face.detectForVideo(video, timestamp);
      const poseResult = cvModels.pose.detectForVideo(video, timestamp);
      
      console.log("MediaPipe results:", { 
        faceDetected: !!faceResult?.faceLandmarks?.length, 
        poseDetected: !!poseResult?.poseLandmarks?.length 
      });
      
      // Compute frame features
      const frameStats = computeFrameFeatures(faceResult, poseResult);
      console.log("Frame stats:", frameStats);
      
      // Update frames immediately for real-time display
      setFrames(prev => {
        const newFrames = [...prev, frameStats];
        const recentFrames = newFrames.slice(-300); // Keep last 300 frames
        
        // Update behavior data in real-time with just the current frame
        const currentEyeContact = frameStats.eyeContact * 100;
        const currentLookingAway = 100 - currentEyeContact;
        
        // For aggregated stats, use recent frames if we have enough
        if (recentFrames.length > 5) {
          const summary = aggregate(recentFrames.slice(-30)); // Last 3 seconds
          if (summary) {
            setBehaviorData(prev => ({
              ...prev,
              attentionScore: Math.round(summary.eyeContactPct),
              eyeContact: Math.round(summary.eyeContactPct),
              lookingAway: Math.round(100 - summary.eyeContactPct),
              headStability: Math.round(Math.max(0, (1 - summary.headStability * 1000)) * 100),
              blinkRate: Math.round(summary.blinkRatePerMin),
              posture: summary.lean
            }));
          }
        } else {
          // Use current frame data for immediate feedback
          setBehaviorData(prev => ({
            ...prev,
            attentionScore: Math.round(currentEyeContact),
            eyeContact: Math.round(currentEyeContact),
            lookingAway: Math.round(currentLookingAway)
          }));
        }
        
        return recentFrames;
      });
      
      // Process with Roboflow (less frequently - every 2 seconds)
      if (isRoboflowLoaded && roboflowReady && now - lastRoboflowTime.current > 2000) {
        lastRoboflowTime.current = now;
        processRoboflowFrame(video, now);
      }
      
      // Update debug info
      fpsCounter.current.count++;
      if (now - fpsCounter.current.lastTime > 1000) {
        setDebugInfo({
          frameCount: frames.length,
          fpsCount: fpsCounter.current.count,
          roboflowFps: roboflowCounter.current.count
        });
        fpsCounter.current.count = 0;
        fpsCounter.current.lastTime = now;
        roboflowCounter.current.count = 0;
      }
      
    } catch (error) {
      console.error("Frame processing error:", error);
      setError(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const processRoboflowFrame = async (video: HTMLVideoElement, timestamp: number) => {
    try {
      const result = await detectObjects(video, { confidence: 0.5 });
      
      if (result) {
        // Update latest classification display
        setLatestClassification({
          class: result.top || 'unknown',
          confidence: result.confidence || 0,
          timestamp
        });
        
        const analytics = analyzeInterviewBehavior(result, timestamp);
        
        // Combine with MediaPipe data
        const mediapipeData = {
          eyeContact: behaviorData.eyeContact / 100,
          headStability: behaviorData.headStability,
          blinkRate: behaviorData.blinkRate,
          posture: behaviorData.posture
        };
        
        const combinedAnalytics = combineAnalytics(analytics, mediapipeData);
        setRoboflowAnalytics(combinedAnalytics);
        
        console.log("Roboflow classification:", result.top, `(${(result.confidence * 100).toFixed(1)}%)`);
        console.log("Combined analytics:", combinedAnalytics);
      }
      
      roboflowCounter.current.count++;
    } catch (error) {
      console.error("Roboflow processing error:", error);
    }
  };

  useEffect(() => {
    if (isMediaPipeLoaded && cvModels) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isMediaPipeLoaded, cvModels]);

  return (
    <div className="grid h-full min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Panel: Webcam and Signals */}
      <div className="flex flex-col gap-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Webcam className="h-5 w-5" />
              Your Camera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full overflow-hidden rounded-md bg-muted relative">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className="h-full w-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
                onLoadedData={() => {
                  if (videoRef.current) {
                    videoRef.current.play();
                  }
                }}
              />
              <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 opacity-0 pointer-events-none" 
              />
              {!isMediaPipeLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">
                      {isProcessing ? "Loading AI Vision..." : "Initializing Camera..."}
                    </p>
                  </div>
                </div>
              )}
              {isMediaPipeLoaded && !error && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    AI Active
                  </div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50 text-white">
                  <div className="text-center p-4">
                    <div className="text-red-300 mb-2">⚠</div>
                    <p className="text-sm">{error}</p>
                    <button 
                      onClick={() => {
                        setError(null);
                        setIsMediaPipeLoaded(false);
                        initializeCamera();
                        loadMediaPipe();
                      }}
                      className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
                    >
                      Retry
                    </button>
                  </div>
                </div>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attention Score</span>
              <span className={cn("font-medium", {
                "text-green-600": behaviorData.attentionScore >= 80,
                "text-yellow-600": behaviorData.attentionScore >= 60 && behaviorData.attentionScore < 80,
                "text-red-600": behaviorData.attentionScore < 60
              })}>{behaviorData.attentionScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speaking Ratio</span>
              <span className="font-medium">{behaviorData.speakingRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Looking Away</span>
              <span className={cn("font-medium", {
                "text-green-600": behaviorData.lookingAway <= 10,
                "text-yellow-600": behaviorData.lookingAway > 10 && behaviorData.lookingAway <= 20,
                "text-red-600": behaviorData.lookingAway > 20
              })}>{behaviorData.lookingAway}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pauses</span>
              <span className="font-medium">{behaviorData.pauses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Head Stability</span>
              <span className={cn("font-medium", {
                "text-green-600": behaviorData.headStability >= 80,
                "text-yellow-600": behaviorData.headStability >= 60,
                "text-red-600": behaviorData.headStability < 60
              })}>{behaviorData.headStability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blink Rate</span>
              <span className="font-medium">{behaviorData.blinkRate}/min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Posture</span>
              <span className={cn("font-medium capitalize", {
                "text-green-600": behaviorData.posture === "neutral",
                "text-yellow-600": behaviorData.posture !== "neutral"
              })}>{behaviorData.posture}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overall Score</span>
              <span className={cn("font-medium", {
                "text-green-600": (behaviorData.attentionScore + behaviorData.headStability) / 2 >= 75,
                "text-yellow-600": (behaviorData.attentionScore + behaviorData.headStability) / 2 >= 60,
                "text-red-600": (behaviorData.attentionScore + behaviorData.headStability) / 2 < 60
              })}>{Math.round((behaviorData.attentionScore + behaviorData.headStability) / 2)}%</span>
            </div>
            <div className="border-t pt-2 text-xs">
              <div className="text-muted-foreground mb-1">System Status:</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>MediaPipe:</span>
                  <span className={cn("font-medium", {
                    "text-green-600": isMediaPipeLoaded && !error,
                    "text-yellow-600": isProcessing,
                    "text-red-600": error
                  })}>{error ? "Error" : isMediaPipeLoaded ? "Active" : "Loading"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Roboflow:</span>
                  <span className={cn("font-medium", {
                    "text-green-600": isRoboflowLoaded,
                    "text-yellow-600": !isRoboflowLoaded
                  })}>{isRoboflowLoaded ? "Active" : "Loading"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing:</span>
                  <span className="font-mono">{debugInfo.fpsCount} fps</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Roboflow Analytics Card */}
        {isRoboflowLoaded && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5" />
                AI Interview Analysis
                {latestClassification && (
                  <div className={cn("ml-auto px-2 py-1 rounded text-xs font-medium", {
                    "bg-green-100 text-green-700": ['professional', 'engaged', 'confident'].includes(latestClassification.class),
                    "bg-yellow-100 text-yellow-700": ['neutral', 'calm'].includes(latestClassification.class),
                    "bg-red-100 text-red-700": ['distracted', 'tired', 'nervous', 'unprofessional'].includes(latestClassification.class)
                  })}>
                    {latestClassification.class}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Professionalism</span>
                <span className={cn("font-medium", {
                  "text-green-600": roboflowAnalytics.professionalism >= 80,
                  "text-yellow-600": roboflowAnalytics.professionalism >= 60,
                  "text-red-600": roboflowAnalytics.professionalism < 60
                })}>{Math.round(roboflowAnalytics.professionalism)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engagement</span>
                <span className={cn("font-medium", {
                  "text-green-600": roboflowAnalytics.engagement >= 80,
                  "text-yellow-600": roboflowAnalytics.engagement >= 60,
                  "text-red-600": roboflowAnalytics.engagement < 60
                })}>{Math.round(roboflowAnalytics.engagement)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alertness</span>
                <span className={cn("font-medium", {
                  "text-green-600": roboflowAnalytics.alertness >= 80,
                  "text-yellow-600": roboflowAnalytics.alertness >= 60,
                  "text-red-600": roboflowAnalytics.alertness < 60
                })}>{Math.round(roboflowAnalytics.alertness)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className={cn("font-medium", {
                  "text-green-600": roboflowAnalytics.confidence >= 80,
                  "text-yellow-600": roboflowAnalytics.confidence >= 60,
                  "text-red-600": roboflowAnalytics.confidence < 60
                })}>{Math.round(roboflowAnalytics.confidence)}%</span>
              </div>
              {roboflowAnalytics.distractions.length > 0 && (
                <div className="border-t pt-2">
                  <div className="flex items-center gap-1 text-red-600 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-medium">Distractions</span>
                  </div>
                  <div className="space-y-1">
                    {roboflowAnalytics.distractions.slice(0, 3).map((distraction, idx) => (
                      <p key={idx} className="text-xs text-red-600">{distraction}</p>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="text-xs text-muted-foreground mb-2">Model Performance:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Rate:</span>
                    <span className="font-mono text-green-600">{debugInfo.roboflowFps}/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span className="font-mono">
                      {latestClassification 
                        ? `${Math.round((Date.now() - latestClassification.timestamp) / 1000)}s ago`
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-2 text-xs">
                <div className="text-muted-foreground mb-1">Latest Classification:</div>
                {latestClassification ? (
                  <div className="space-y-1">
                    <div className="font-mono text-blue-600 capitalize">
                      {latestClassification.class}
                    </div>
                    <div className="text-muted-foreground">
                      {(latestClassification.confidence * 100).toFixed(1)}% confidence
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(latestClassification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Waiting for classification...</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Middle Panel: Interview Chat */}
      <Card className="flex flex-col lg:col-span-6">
        <CardHeader>
          <CardTitle>Interview Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex items-start gap-3", msg.sender === 'candidate' && "flex-row-reverse")}>
                  <Avatar>
                    <AvatarImage src={msg.sender === 'agent' ? undefined : "https://placehold.co/100x100.png"} alt={msg.sender} data-ai-hint="profile avatar" />
                    <AvatarFallback>{msg.sender === 'agent' ? 'AI' : 'ME'}</AvatarFallback>
                  </Avatar>
                  <div className={cn("max-w-sm rounded-lg p-3 sm:max-w-md", msg.sender === 'agent' ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <div className="relative">
            <Textarea
              placeholder="Your answer..."
              className="resize-none pr-24"
              rows={3}
            />
            <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Record Audio">
                <Mic className="h-4 w-4" />
              </Button>
              <Button aria-label="Send Message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Panel: Transcript */}
      <Card className="hidden flex-col lg:col-span-3 lg:flex">
        <CardHeader>
          <CardTitle className="text-base">Live Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4 text-sm">
              {messages.map((msg, index) => (
                <div key={index}>
                  <p className="font-bold capitalize">{msg.sender === 'agent' ? 'Interviewer' : 'You'}</p>
                  <p className="text-muted-foreground">{msg.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
