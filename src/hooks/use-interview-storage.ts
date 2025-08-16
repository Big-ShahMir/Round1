import { useState, useEffect } from 'react';
import { InterviewState } from '@/lib/interview-service';

export function useInterviewStorage(interviewId: string) {
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInterview = () => {
      try {
        const stored = localStorage.getItem(`interview-${interviewId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          parsed.transcript = parsed.transcript.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setInterviewState(parsed);
        }
      } catch (error) {
        console.error('Failed to load interview state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interviewId]);

  const saveInterview = (state: InterviewState) => {
    try {
      localStorage.setItem(`interview-${interviewId}`, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save interview state:', error);
    }
  };

  return { interviewState, loading, saveInterview };
} 