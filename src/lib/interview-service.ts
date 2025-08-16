import { generateInterviewQuestion, type GenerateInterviewQuestionInput, type GenerateInterviewQuestionOutput } from '@/ai/flows/generate-interview-question';
import { scoreInterview, type ScoreInterviewInput, type ScoreInterviewOutput } from '@/ai/flows/score-interview';

export interface InterviewMessage {
  speaker: 'agent' | 'candidate';
  text: string;
  timestamp: Date;
}

export interface InterviewState {
  id: string;
  jobDescription: string;
  skillsRequired: string[];
  resume: {
    summary: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      bullets: string[];
    }>;
  };
  transcript: InterviewMessage[];
  behaviorSignals: {
    attentionScoreAvg: number;
    speakingRatio: number;
    lookingAwayPctAvg: number;
    pausesCount: number;
  };
  currentQuestion?: GenerateInterviewQuestionOutput;
  maxDepth: number;
  isComplete: boolean;
  score?: ScoreInterviewOutput;
}

export class InterviewService {
  private state: InterviewState;

  constructor(
    jobDescription: string,
    skillsRequired: string[],
    resume: InterviewState['resume'],
    maxDepth: number = 5
  ) {
    this.state = {
      id: `interview-${Date.now()}`,
      jobDescription,
      skillsRequired,
      resume,
      transcript: [],
      behaviorSignals: {
        attentionScoreAvg: 0,
        speakingRatio: 0,
        lookingAwayPctAvg: 0,
        pausesCount: 0,
      },
      maxDepth,
      isComplete: false,
    };
  }

  async generateNextQuestion(): Promise<GenerateInterviewQuestionOutput | null> {
    if (this.state.isComplete || this.state.transcript.length >= this.state.maxDepth * 2) {
      return null;
    }

    const input: GenerateInterviewQuestionInput = {
      jobDescription: this.state.jobDescription,
      skillsRequired: this.state.skillsRequired,
      resume: this.state.resume,
      transcriptSoFar: this.state.transcript.map(msg => ({
        speaker: msg.speaker,
        text: msg.text,
      })),
      previousSignals: this.state.transcript.length > 0 ? {
        attentionScoreAvg: this.state.behaviorSignals.attentionScoreAvg,
        speakingRatio: this.state.behaviorSignals.speakingRatio,
      } : undefined,
      maxDepth: this.state.maxDepth,
    };

    try {
      const question = await generateInterviewQuestion(input);
      this.state.currentQuestion = question;
      
      // Add the question to transcript
      this.addMessage('agent', question.question);
      
      return question;
    } catch (error) {
      console.error('Failed to generate question:', error);
      return null;
    }
  }

  addMessage(speaker: 'agent' | 'candidate', text: string): void {
    this.state.transcript.push({
      speaker,
      text,
      timestamp: new Date(),
    });
  }

  updateBehaviorSignals(signals: Partial<InterviewState['behaviorSignals']>): void {
    this.state.behaviorSignals = { ...this.state.behaviorSignals, ...signals };
  }

  async completeInterview(): Promise<ScoreInterviewOutput> {
    this.state.isComplete = true;

    const input: ScoreInterviewInput = {
      job: {
        title: 'Software Engineer', // This could be made configurable
        skillsRequired: this.state.skillsRequired,
        thresholds: {
          overall: 70, // Default threshold
        },
      },
      resume: this.state.resume,
      transcript: this.state.transcript.map(msg => ({
        speaker: msg.speaker,
        text: msg.text,
      })),
      behavior: this.state.behaviorSignals,
      weights: {
        interview: 0.6,
        resume: 0.2,
        behavior: 0.2,
      },
    };

    try {
      const score = await scoreInterview(input);
      this.state.score = score;
      return score;
    } catch (error) {
      console.error('Failed to score interview:', error);
      throw error;
    }
  }

  getState(): InterviewState {
    return { ...this.state };
  }

  saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`interview-${this.state.id}`, JSON.stringify(this.state));
      } catch (error) {
        console.error('Failed to save interview state:', error);
      }
    }
  }

  static loadFromStorage(interviewId: string): InterviewState | null {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`interview-${interviewId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          parsed.transcript = parsed.transcript.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          return parsed;
        }
      } catch (error) {
        console.error('Failed to load interview state:', error);
      }
    }
    return null;
  }

  getTranscript(): InterviewMessage[] {
    return [...this.state.transcript];
  }

  getCurrentQuestion(): GenerateInterviewQuestionOutput | undefined {
    return this.state.currentQuestion;
  }

  isInterviewComplete(): boolean {
    return this.state.isComplete;
  }
} 