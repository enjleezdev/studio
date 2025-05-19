// stock-level-suggestions.ts
'use server';
/**
 * @fileOverview An AI agent that suggests optimal stock levels based on historical data.
 *
 * - stockLevelSuggestions - A function that suggests optimal stock levels for each item.
 * - StockLevelSuggestionsInput - The input type for the stockLevelSuggestions function.
 * - StockLevelSuggestionsOutput - The return type for the stockLevelSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StockLevelSuggestionsInputSchema = z.object({
  itemId: z.string().describe('The ID of the item to analyze.'),
  historicalData: z.string().describe('Historical data for the item, including past demand, supply chain disruptions, and sales trends.'),
});
export type StockLevelSuggestionsInput = z.infer<typeof StockLevelSuggestionsInputSchema>;

const StockLevelSuggestionsOutputSchema = z.object({
  suggestedStockLevel: z.number().describe('The suggested stock level for the item.'),
  reasoning: z.string().describe('The reasoning behind the suggested stock level.'),
  alert: z.string().optional().describe('An alert message if there is a potential shortage or overstock.'),
});
export type StockLevelSuggestionsOutput = z.infer<typeof StockLevelSuggestionsOutputSchema>;

export async function stockLevelSuggestions(input: StockLevelSuggestionsInput): Promise<StockLevelSuggestionsOutput> {
  return stockLevelSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockLevelSuggestionsPrompt',
  input: {schema: StockLevelSuggestionsInputSchema},
  output: {schema: StockLevelSuggestionsOutputSchema},
  prompt: `You are an expert inventory manager. Analyze the historical data for the item and suggest an optimal stock level.

Item ID: {{{itemId}}}
Historical Data: {{{historicalData}}}

Consider past demand, supply chain disruptions, and sales trends.

Provide the suggested stock level, the reasoning behind it, and an alert message if there is a potential shortage or overstock.

Output should be in JSON format.
`,
});

const stockLevelSuggestionsFlow = ai.defineFlow(
  {
    name: 'stockLevelSuggestionsFlow',
    inputSchema: StockLevelSuggestionsInputSchema,
    outputSchema: StockLevelSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
