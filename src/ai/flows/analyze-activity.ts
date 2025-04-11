'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeActivityInputSchema = z.object({
  frameData: z
    .string()
    .describe(
      'Base64 encoded string of the webcam frame data. Should be in a standard image format like JPEG or PNG.'
    ),
});
export type AnalyzeActivityInput = z.infer<typeof AnalyzeActivityInputSchema>;

const AnalyzeActivityOutputSchema = z.object({
  activity: z.string().describe('The detected human activity.'),
  confidence: z.number().describe('Confidence score of the detected activity (0-1).'),
});
export type AnalyzeActivityOutput = z.infer<typeof AnalyzeActivityOutputSchema>;

export async function analyzeActivity(input: AnalyzeActivityInput): Promise<AnalyzeActivityOutput> {
  return analyzeActivityFlow(input);
}

const analyzeActivityPrompt = ai.definePrompt({
  name: 'analyzeActivityPrompt',
  input: {
    schema: z.object({
      frameData: z
        .string()
        .describe(
          'Base64 encoded string of the webcam frame data. Should be in a standard image format like JPEG or PNG.'
        ),
    }),
  },
  output: {
    schema: z.object({
      activity: z.string().describe('The detected human activity.'),
      confidence: z.number().describe('Confidence score of the detected activity (0-1).'),
    }),
  },
  prompt: `You are an AI activity recognition expert. Analyze the provided webcam frame data and identify the human activity being performed. Return the activity and a confidence score (0-1). The \"activity\" value should be a single word. Possible \"activity\" values include: sleeping, sitting, waving, standing, walking, running, clapping, typing, reading, exercising, dancing, and unknown. If you cannot determine the activity or no activity is present, return \"unknown\".

Webcam Frame Data: {{media url=frameData}}`,
});

const analyzeActivityFlow = ai.defineFlow<
  typeof AnalyzeActivityInputSchema,
  typeof AnalyzeActivityOutputSchema
>(
  {
    name: 'analyzeActivityFlow',
    inputSchema: AnalyzeActivityInputSchema,
    outputSchema: AnalyzeActivityOutputSchema,
  },
  async input => {
    const {output} = await analyzeActivityPrompt(input);
    return output!;
  }
);
