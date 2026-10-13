import { generateText, streamText, tool, jsonSchema, isStepCount, type Tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  ILanguageModel,
  LanguageModelMessage,
  GenerateTextOptions,
  ChatOptions,
  ToolDefinition,
} from '../domain/models/language-model';

function getModelName(tier: 'flash' | 'pro' = 'flash'): string {
  if (tier === 'pro') return 'gemini-3.1-pro-preview';
  return 'gemini-3.6-flash';
}

function buildGoogleProvider() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  return createGoogleGenerativeAI({ apiKey: apiKey ?? '' });
}

function mapTools(definitions?: ToolDefinition[]) {
  if (!definitions || definitions.length === 0) return undefined;
  const toolsRecord: Record<string, Tool> = {};
  for (const def of definitions) {
    toolsRecord[def.name] = tool({
      description: def.description,
      inputSchema: jsonSchema(def.parameters as Parameters<typeof jsonSchema>[0]),
      execute: async (args: unknown) => def.execute(args as Record<string, unknown>),
    });
  }
  return toolsRecord;
}

function buildChatRequest(messages: LanguageModelMessage[], options?: ChatOptions) {
  const systemParts = [
    options?.systemPrompt,
    ...messages.filter((m) => m.role === 'system').map((m) => m.content),
  ].filter(Boolean);

  return {
    model: buildGoogleProvider()(getModelName(options?.tier ?? 'flash')),
    instructions: systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
    messages: messages
      .filter((m): m is typeof m & { role: 'user' | 'assistant' } => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content })),
    tools: mapTools(options?.tools),
    stopWhen: isStepCount(options?.tools ? 4 : 1),
    maxOutputTokens: options?.maxTokens ?? 800,
    temperature: options?.temperature ?? 0.3,
  };
}

export class GeminiLanguageModel implements ILanguageModel {
  async generateText(prompt: string, options?: GenerateTextOptions): Promise<string> {
    const google = buildGoogleProvider();
    const model = google(getModelName(options?.tier));
    const result = await generateText({
      model,
      instructions: options?.systemPrompt,
      prompt,
      maxOutputTokens: options?.maxTokens ?? 800,
      temperature: options?.temperature ?? 0.2,
    });
    return result.text;
  }

  async generateStructured<T>(prompt: string, schemaPrompt: string, options?: GenerateTextOptions): Promise<T> {
    const combinedPrompt = `${prompt}\n\nResponda ESTRITAMENTE em formato JSON compatível com:\n${schemaPrompt}`;
    const text = await this.generateText(combinedPrompt, { ...options, tier: options?.tier ?? 'flash' });
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as T;
  }

  async chat(messages: LanguageModelMessage[], options?: ChatOptions): Promise<string> {
    const result = await generateText(buildChatRequest(messages, options));
    return result.text;
  }

  async *stream(messages: LanguageModelMessage[], options?: ChatOptions): AsyncIterable<string> {
    let separatorPending = false;
    let hasText = false;
    for await (const part of streamText(buildChatRequest(messages, options)).fullStream) {
      if (part.type === 'error') throw part.error instanceof Error ? part.error : new Error(String(part.error));
      if (part.type === 'start-step') separatorPending = hasText;
      if (part.type !== 'text-delta') continue;
      yield separatorPending ? `\n\n${part.text}` : part.text;
      separatorPending = false;
      hasText = true;
    }
  }
}
