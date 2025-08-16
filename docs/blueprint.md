# **App Name**: Round1 Interview Automator

## Core Features:

- Interview UI: Candidate-facing interview UI with resume upload, webcam/mic capture, chat interface, and transcript display.
- AI Interviewer: AI-powered interviewer using Vertex AI Gemini to generate interview questions based on job description, resume, and prior answers.
- Real-time Transcript: Real-time transcript generation using Google Cloud Speech-to-Text, displayed alongside the interview chat.
- Behavior Signals: On-device behavior signal capture using MediaPipe Tasks Web to track attention, pose, and speaking patterns, sending anonymized aggregates to the backend.
- Recruiter Dashboard: Recruiter dashboard to view candidate lists, interview summaries, pass/fail status, and downloadable profiles.
- AI Scoring: Final scoring and rubric generation using Vertex AI Gemini, based on resume, transcript, and behavior signals, with bias detection tool.
- Firebase Backend: Firebase integration for authentication, data storage (Firestore and Storage), and serverless functions.

## Style Guidelines:

- Primary color: Dark indigo (#4B0082) to evoke a sense of professionalism and competence, as well as create enough contrast to have sufficient readability.
- Background color: Very dark gray (#222222), suitable for a dark color scheme.
- Accent color: Electric violet (#8F00FF), an analogous color to indigo, but much brighter, for focus and contrast.
- Font: 'Inter', a grotesque-style sans-serif suitable for both headlines and body text, fitting the MVP constraint of one font only. 
- Use clear, professional icons from a consistent set (e.g., Material Design Icons) for actions and data visualization.
- Clean and structured layout with clear sections for interview chat, transcript, and candidate information.
- Subtle animations for loading states and transitions to enhance the user experience without being distracting.