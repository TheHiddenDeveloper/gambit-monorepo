import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_api_key_here') {
  throw new Error(
    'GEMINI_API_KEY is not set. Please add your API key to .env.local and restart the server.'
  );
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
