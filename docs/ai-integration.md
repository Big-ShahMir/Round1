# AI Integration Documentation

## Overview

This document describes how the AI flows in `src/ai/flows/` are integrated with the interview interface to provide dynamic, AI-powered interview experiences.

## Architecture

### Core Components

1. **InterviewService** (`src/lib/interview-service.ts`)
   - Manages interview state and coordinates AI interactions
   - Handles question generation and interview scoring
   - Provides persistence layer for interview data

2. **AIInterviewRoom** (`src/components/AIInterviewRoom.tsx`)
   - Main interview interface component
   - Integrates with AI flows for dynamic question generation
   - Handles real-time behavioral analysis
   - Manages interview flow and completion

3. **AI Flows**
   - `generate-interview-question.ts`: Generates contextual interview questions
   - `score-interview.ts`: Evaluates interview performance and provides scoring

## How It Works

### 1. Interview Initialization

When a new interview starts:

```typescript
const service = new InterviewService(
  jobDescription,
  skillsRequired,
  resume,
  maxDepth
);
```

The service is initialized with:
- Job description and required skills
- Candidate's resume information
- Maximum interview depth (number of questions)

### 2. Dynamic Question Generation

The AI generates questions based on:

- **Job Context**: Description and required skills
- **Resume Analysis**: Candidate's background and experience
- **Interview Progress**: Previous questions and answers
- **Behavioral Signals**: Real-time attention and engagement metrics

```typescript
const question = await interviewService.generateNextQuestion();
```

Questions are categorized as:
- `experience`: Past work and projects
- `skill`: Technical abilities
- `behavioral`: Problem-solving and soft skills
- `culture-add`: Team fit and values
- `project-deep-dive`: Detailed technical discussions

### 3. Real-time Behavioral Analysis

During the interview, computer vision analysis provides:

- **Eye Contact Percentage**: Attention and engagement
- **Blink Rate**: Natural behavior patterns
- **Posture Analysis**: Professional presentation
- **Head Stability**: Focus and concentration

These signals are fed back to the AI for context-aware question generation.

### 4. Interview Scoring

When the interview completes, the AI evaluates:

- **Interview Performance**: Quality of answers and communication
- **Resume Match**: Alignment with job requirements
- **Behavioral Signals**: Professional presentation and engagement
- **Overall Assessment**: Pass/fail decision with detailed feedback

```typescript
const score = await interviewService.completeInterview();
```

## Integration Points

### Question Generation Flow

1. User submits an answer
2. Answer is added to transcript
3. Behavioral signals are updated
4. AI generates next question based on context
5. Question is displayed to user

### Scoring Flow

1. Interview reaches completion criteria
2. Full transcript and behavioral data are sent to AI
3. AI evaluates performance across multiple dimensions
4. Results are saved and user is redirected to report

## Data Flow

```
User Input → InterviewService → AI Flows → Dynamic Questions
     ↓
Behavioral Analysis → CV Processing → Signal Updates
     ↓
Interview Completion → AI Scoring → Report Generation
```

## Configuration

### Mock Data

For development, the system uses mock data:

```typescript
const mockJobData = {
  description: "Software Engineer role...",
  skillsRequired: ["JavaScript", "React", "Node.js", ...]
};

const mockResume = {
  summary: "Experienced software engineer...",
  skills: ["JavaScript", "React", "Node.js", ...],
  experience: [...]
};
```

In production, this would be replaced with real job postings and candidate profiles.

### AI Model Configuration

The AI flows use Genkit for:
- Prompt management
- Schema validation
- Safety settings
- Model configuration

## Future Enhancements

1. **Speech-to-Text Integration**: Convert audio responses to text
2. **Real-time Question Adaptation**: Adjust questions based on live behavioral signals
3. **Multi-language Support**: Support for interviews in different languages
4. **Advanced Analytics**: Detailed behavioral insights and trends
5. **Custom Question Banks**: Industry-specific question templates

## Error Handling

The system includes comprehensive error handling for:
- AI service failures
- Network connectivity issues
- Invalid input data
- Browser compatibility problems

## Performance Considerations

- AI calls are optimized to minimize latency
- Behavioral analysis runs at 10fps for real-time feedback
- Interview state is persisted locally for recovery
- Large transcripts are processed efficiently

## Security

- No sensitive data is stored in browser storage
- AI prompts include bias detection and safety filters
- All data transmission is encrypted
- Privacy-compliant behavioral analysis 