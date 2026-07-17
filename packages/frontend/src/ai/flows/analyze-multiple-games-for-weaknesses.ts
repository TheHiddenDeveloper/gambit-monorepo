'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing multiple chess games to identify strategic weaknesses in a player's gameplay.
 *
 * - analyzeMultipleGames - A function that takes a list of PGNs and returns an analysis of the player's weaknesses.
 * - AnalyzeMultipleGamesInput - The input type for the analyzeMultipleGames function.
 * - AnalyzeMultipleGamesOutput - The return type for the analyzeMultipleGames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMultipleGamesInputSchema = z.object({
  pgns: z
    .array(z.string())
    .describe('An array of chess games in PGN format.'),
});
export type AnalyzeMultipleGamesInput = z.infer<typeof AnalyzeMultipleGamesInputSchema>;

const AnalyzeMultipleGamesOutputSchema = z.object({
  weaknesses: z
    .array(z.string())
    .describe('A list of strategic weaknesses identified in the player s gameplay.'),
  suggestedImprovements: z
    .array(z.string())
    .describe('A list of suggested improvements based on the identified weaknesses.'),
});
export type AnalyzeMultipleGamesOutput = z.infer<typeof AnalyzeMultipleGamesOutputSchema>;

export async function analyzeMultipleGames(
  input: AnalyzeMultipleGamesInput
): Promise<AnalyzeMultipleGamesOutput> {
  return analyzeMultipleGamesFlow(input);
}

const analyzeMultipleGamesPrompt = ai.definePrompt({
  name: 'analyzeMultipleGamesPrompt',
  input: {schema: AnalyzeMultipleGamesInputSchema},
  output: {schema: AnalyzeMultipleGamesOutputSchema},
  prompt: `You are an expert chess coach analyzing a player's games to identify strategic weaknesses and suggest improvements.

  Analyze the following chess games (provided in PGN format) and identify recurring strategic weaknesses in the player's gameplay.
  Based on the identified weaknesses, suggest specific areas for improvement.

  Games:
  {{#each pgns}}
  {{this}}
  {{/each}}
  `,
});

const analyzeMultipleGamesFlow = ai.defineFlow(
  {
    name: 'analyzeMultipleGamesFlow',
    inputSchema: AnalyzeMultipleGamesInputSchema,
    outputSchema: AnalyzeMultipleGamesOutputSchema,
  },
  async input => {
    const {output} = await analyzeMultipleGamesPrompt(input);
    return output!;
  }
);
