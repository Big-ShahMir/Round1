'use server';

/**
 * @fileOverview This file defines the generateInterviewQuestion flow, which generates interview questions based on the job description, candidate resume, and interview transcript.
 *
 * @fileOverview
 * - generateInterviewQuestion - A function that generates the interview question.
 * - GenerateInterviewQuestionInput - The input type for the generateInterviewQuestion function.
 * - GenerateInterviewQuestionOutput - The return type for the generateInterviewQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionInputSchema = z.object({
  jobDescription: z.string().describe('The description of the job.'),
  skillsRequired: z.array(z.string()).describe('An array of skills required for the job.'),
  resume: z
    .object({
      summary: z.string().describe('A summary of the candidate\'s resume.'),
      skills: z.array(z.string()).describe('An array of skills listed on the resume.'),
      experience:
        z.array(
          z.object({
            title: z.string().describe('The title of the position.'),
            company: z.string().describe('The company where the position was held.'),
            bullets: z.array(z.string()).describe('An array of bullet points describing the responsibilities and accomplishments in the position.'),
          })
        )
        .describe('An array of the candidate\'s work experiences.'),
    })
    .describe('The candidate\'s resume information.'),
  transcriptSoFar:
    z.array(
      z.object({
        speaker: z.enum(['agent', 'candidate']).describe('The speaker of the text.'),
        text: z.string().describe('The text of the message.'),
      })
    )
    .describe('The transcript of the interview so far.'),
  previousSignals:
    z
      .object({
        attentionScoreAvg: z.number().describe('The average attention score of the candidate.'),
        speakingRatio: z.number().describe('The speaking ratio of the candidate.'),
      })
      .optional()
      .describe('The previous behavior signals from the candidate.'),
  maxDepth: z.number().describe('The maximum depth of the interview.'),
});

export type GenerateInterviewQuestionInput = z.infer<typeof GenerateInterviewQuestionInputSchema>;

const GenerateInterviewQuestionOutputSchema = z.object({
  question: z.string().describe('The interview question to ask the candidate.'),
  category:
    z.enum(['experience', 'skill', 'behavioral', 'culture-add', 'project-deep-dive']).describe('The category of the interview question.'),
  followupHints: z.array(z.string()).describe('Hints for follow-up questions.'),
  shouldWrapUp: z.boolean().describe('Whether the interview should wrap up.'),
});

export type GenerateInterviewQuestionOutput = z.infer<typeof GenerateInterviewQuestionOutputSchema>;

export async function generateInterviewQuestion(input: GenerateInterviewQuestionInput): Promise<GenerateInterviewQuestionOutput> {
  return generateInterviewQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionPrompt',
  input: {schema: GenerateInterviewQuestionInputSchema},
  output: {schema: GenerateInterviewQuestionOutputSchema},
  prompt: `You are Round1, a professional yet conversational first-round interviewer. Your goal is to conduct a natural, engaging interview that feels like a genuine conversation while maintaining professional standards.

  Job Description: {{{jobDescription}}}
  Skills Required: {{#each skillsRequired}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Resume Summary: {{{resume.summary}}}
  Resume Skills: {{#each resume.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Resume Experience: {{#each resume.experience}}
    Title: {{{title}}}
    Company: {{{company}}}
    Bullets: {{#each bullets}} - {{{this}}} {{/each}}
  {{/each}}

  Transcript So Far: {{#each transcriptSoFar}}Speaker: {{{speaker}}}, Text: {{{text}}}\n{{/each}}

  Previous Signals: {{#if previousSignals}}Attention Score Avg: {{{previousSignals.attentionScoreAvg}}}, Speaking Ratio: {{{previousSignals.speakingRatio}}}{{else}}No previous signals{{/if}}

  Interview Style Guidelines:
  - Be conversational and engaging while maintaining professionalism
  - Acknowledge and respond to what the candidate has shared
  - If their response was detailed and insightful, show appreciation and build on it
  - If their response was brief or unclear, gently ask for more detail or clarification
  - Use natural transitions and conversational phrases like "That's interesting," "I see," "Could you tell me more about..."
  - Reference specific details from their previous responses when asking follow-ups
  - Keep questions concise but conversational (2-3 sentences max)
  - Avoid robotic or overly formal language
  - If the candidate seems nervous, be encouraging and supportive
  - Always maintain job-relevance and avoid demographic or legally protected topics

  Response Strategy:
  - If the candidate provided a good answer: Acknowledge it briefly, then ask a follow-up question
  - If the candidate's answer was vague: Ask for specific examples or clarification
  - If the candidate seems to be struggling: Offer encouragement and ask a simpler question
  - If the candidate is very detailed: Show appreciation and dive deeper into a specific aspect

  Output JSON (schema):
  { 
    "question": string,
    "category": "experience"|"skill"|"behavioral"|"culture-add"|"project-deep-dive",
    "followupHints": string[],
    "shouldWrapUp": boolean
  }
  `,
});

const generateInterviewQuestionFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionFlow',
    inputSchema: GenerateInterviewQuestionInputSchema,
    outputSchema: GenerateInterviewQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
