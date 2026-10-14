import { GoogleGenAI } from '@google/genai';

export const GEMINI_FLASH_MODEL = 'gemini-3.6-flash';

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured (missing GEMINI_API_KEY).');
  client = new GoogleGenAI({ apiKey });
  return client;
}
