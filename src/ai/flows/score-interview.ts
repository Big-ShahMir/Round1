'use server';

/**
 * @fileOverview This file contains the Genkit flow for scoring an interview based on the candidate's resume, interview transcript, and behavior signals.
 *
 * - scoreInterview - A function that handles the interview scoring process.
 * - ScoreInterviewInput - The input type for the scoreInterview function.
 * - ScoreInterviewOutput - The return type for the scoreInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreInterviewInputSchema = z.object({
  job: z.object({
    title: z.string().describe('The title of the job.'),
    skillsRequired: z.array(z.string()).describe('The skills required for the job.'),
    thresholds: z
      .object({overall: z.number().describe('The overall threshold for passing.')})
      .describe('The thresholds for the job.'),
  }).describe('The job details.'),
  resume: z
    .object({
      summary: z.string().describe('The summary of the resume.'),
      skills: z.array(z.string()).describe('The skills listed in the resume.'),
      experience: z
        .array(
          z.object({
            title: z.string().describe('The title of the experience.'),
            company: z.string().describe('The company of the experience.'),
            bullets: z.array(z.string()).describe('The bullet points of the experience.'),
          })
        )
        .describe('The experience listed in the resume.'),
    })
    .describe('The resume details.'),
  transcript: z
    .array(
      z.object({
        speaker: z.enum(['agent', 'candidate']).describe('The speaker of the transcript.'),
        text: z.string().describe('The text of the transcript.'),
      })
    )
    .describe('The transcript of the interview.'),
  behavior: z
    .object({
      attentionScoreAvg: z.number().describe('The average attention score.'),
      speakingRatio: z.number().describe('The speaking ratio.'),
      lookingAwayPctAvg: z.number().describe('The average percentage of time looking away.'),
      pausesCount: z.number().describe('The number of pauses.'),
      blinkRatePerMin: z.number().describe('The blink rate per minute.'),
      headStability: z.number().describe('The head stability score (lower is more stable).'),
      lean: z.string().describe('The posture lean direction (forward/neutral/back).'),
      fidgetScore: z.number().describe('The fidget score (movement between frames).'),
      behaviorScore: z.number().describe('The computed behavioral score (0-100).'),
      duration: z.number().describe('The total interview duration in seconds.'),
    })
    .describe('The behavior signals from the interview.'),
  weights: z
    .object({
      interview: z.number().describe('The weight of the interview score.'),
      resume: z.number().describe('The weight of the resume score.'),
      behavior: z.number().describe('The weight of the behavior score.'),
    })
    .describe('The weights for scoring.'),
});
export type ScoreInterviewInput = z.infer<typeof ScoreInterviewInputSchema>;

const ScoreInterviewOutputSchema = z.object({
  interviewScore: z.number().describe('The score of the interview.'),
  resumeScore: z.number().describe('The score of the resume.'),
  behaviorScore: z.number().describe('The score of the behavior.'),
  overall: z.number().describe('The overall score.'),
  pass: z.boolean().describe('Whether the candidate passed the interview.'),
  summary: z.string().describe('The summary of the interview.'),
  skillHighlights: z.array(z.string()).describe('The skill highlights from the interview.'),
  concerns: z.array(z.string()).describe('The concerns from the interview.'),
  redFlags: z.array(z.string()).describe('The red flags from the interview.'),
  biasCheck: z
    .object({
      flagged: z.boolean().describe('Whether the interview was flagged for bias.'),
      notes: z.string().describe('The notes on the bias check.'),
    })
    .describe('The bias check results.'),
});
export type ScoreInterviewOutput = z.infer<typeof ScoreInterviewOutputSchema>;

export async function scoreInterview(input: ScoreInterviewInput): Promise<ScoreInterviewOutput> {
  return scoreInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreInterviewPrompt',
  input: {schema: ScoreInterviewInputSchema},
  output: {schema: ScoreInterviewOutputSchema},
  prompt: `You are an objective hiring assistant. Score strictly against the job requirements. Provide JSON only.

Here are the details for the job:
Job Title: {{{job.title}}}
Skills Required: {{#each job.skillsRequired}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Overall Threshold: {{{job.thresholds.overall}}}

Here are the details for the resume:
Summary: {{{resume.summary}}}
Skills: {{#each resume.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Experience: {{#each resume.experience}}
Title: {{{this.title}}}
Company: {{{this.company}}}
Bullets: {{#each this.bullets}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Here is the transcript of the interview:
{{#each transcript}}
Speaker: {{{this.speaker}}}
Text: {{{this.text}}}
{{/each}}

Here are the behavior signals from the interview:
Average Attention Score: {{{behavior.attentionScoreAvg}}}
Speaking Ratio: {{{behavior.speakingRatio}}}
Average Percentage of Time Looking Away: {{{behavior.lookingAwayPctAvg}}}
Number of Pauses: {{{behavior.pausesCount}}}
Blink Rate per Minute: {{{behavior.blinkRatePerMin}}}
Head Stability Score: {{{behavior.headStability}}}
Posture Lean: {{{behavior.lean}}}
Fidget Score: {{{behavior.fidgetScore}}}
Computed Behavioral Score: {{{behavior.behaviorScore}}}
Interview Duration: {{{behavior.duration}}} seconds

Here are the weights for scoring:
Interview Weight: {{{weights.interview}}}
Resume Weight: {{{weights.resume}}}
Behavior Weight: {{{weights.behavior}}}

Rubric dimensions (0–5 each):
- Problem Solving
- Communication Clarity
- Technical/Role Skills Match
- Evidence/Examples Quality
- Professionalism (text-only; do not infer protected traits)

Compute:
- interviewScore (0–100)
- resumeScore (0–100)
- behaviorScore (0–100) using only aggregates (no protected attributes)
- overall = weighted sum (0–100)
- pass = overall >= thresholds.overall
- summary (<=120 words), skillHighlights[], concerns[], redFlags[]
- biasCheck: flag if reasoning references demographics or protected classes.
`,
  system: `You are an objective hiring assistant. Score strictly against the job requirements. Provide JSON only.`,  
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const scoreInterviewFlow = ai.defineFlow(
  {
    name: 'scoreInterviewFlow',
    inputSchema: ScoreInterviewInputSchema,
    outputSchema: ScoreInterviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
