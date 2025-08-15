"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Mic, Send, Webcam, BarChart2 } from "lucide-react";
import Image from "next/image";
import React from "react";

const messages = [
  { sender: "agent", text: "Thanks for your interest in the Software Engineer role. To start, can you tell me about a challenging project you've worked on and how you approached it?" },
  { sender: "candidate", text: "Of course. One of the most challenging projects was building a real-time data processing pipeline. We had to handle millions of events per second with low latency. My approach was to use a combination of Kafka for message queuing and Apache Flink for stream processing. We also implemented a robust monitoring and alerting system using Prometheus and Grafana to ensure reliability." },
  { sender: "agent", text: "That sounds impressive. Could you elaborate on the monitoring system? What specific metrics did you track?" },
];

export default function InterviewPage({ params }: { params: { id: string } }) {
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
            <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
              <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="Webcam feed" data-ai-hint="webcam placeholder" className="h-full w-full object-cover" />
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
              <span className="font-medium">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speaking Ratio</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Looking Away</span>
              <span className="font-medium">8%</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Pauses</span>
              <span className="font-medium">3</span>
            </div>
          </CardContent>
        </Card>
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
