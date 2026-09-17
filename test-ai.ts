import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const result = streamText({
    model: google('gemini-1.5-pro'),
    prompt: 'oi',
  });
  console.log(Object.keys(result));
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}
run();
