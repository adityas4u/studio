// src/ai/flows/display-confidence-scores.ts
'use server';

/**
 * @fileOverview Flow to display confidence scores for detected activities.
 *
 * - displayConfidenceScores - A function that handles displaying the confidence scores for detected activities.
 * - DisplayConfidenceScoresInput - The input type for the displayConfidenceScores function.
 * - DisplayConfidenceScoresOutput - The return type for the displayConfidenceScores function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DisplayConfidenceScoresInputSchema = z.object({
  activity: z.string().describe('The detected activity.'),
  confidence: z.number().describe('The confidence score for the detected activity (0-1).'),
});
export type DisplayConfidenceScoresInput = z.infer<typeof DisplayConfidenceScoresInputSchema>;

const DisplayConfidenceScoresOutputSchema = z.object({
  display: z.string().describe('The display string showing the activity and confidence score.'),
});
export type DisplayConfidenceScoresOutput = z.infer<typeof DisplayConfidenceScoresOutputSchema>;

export async function displayConfidenceScores(input: DisplayConfidenceScoresInput): Promise<DisplayConfidenceScoresOutput> {
  return displayConfidenceScoresFlow(input);
}

const displayConfidenceScoresPrompt = ai.definePrompt({
  name: 'displayConfidenceScoresPrompt',
  input: {
    schema: z.object({
      activity: z.string().describe('The detected activity.'),
      confidence: z.number().describe('The confidence score for the detected activity (0-1).'),
    }),
  },
  output: {
    schema: z.object({
      display: z.string().describe('The display string showing the activity and confidence score.'),
    }),
  },
  prompt: `Activity: {{{activity}}}\nConfidence: {{confidence}}.\n\nCreate a user-friendly display string showing the activity and confidence score. Format the confidence score as a percentage.
`,
});

const displayConfidenceScoresFlow = ai.defineFlow<
  typeof DisplayConfidenceScoresInputSchema,
  typeof DisplayConfidenceScoresOutputSchema
>(
  {
    name: 'displayConfidenceScoresFlow',
    inputSchema: DisplayConfidenceScoresInputSchema,
    outputSchema: DisplayConfidenceScoresOutputSchema,
  },
  async input => {
    const {output} = await displayConfidenceScoresPrompt(input);
    return output!;
  }
);
