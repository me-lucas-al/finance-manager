export type ModelTier = 'flash' | 'pro';

export type LanguageModelMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

export type GenerateTextOptions = {
  tier?: ModelTier;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
};

export type ChatOptions = {
  tier?: ModelTier;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  tools?: ToolDefinition[];
};

export interface ILanguageModel {
  generateText(prompt: string, options?: GenerateTextOptions): Promise<string>;
  generateStructured<T>(prompt: string, schemaPrompt: string, options?: GenerateTextOptions): Promise<T>;
  chat(messages: LanguageModelMessage[], options?: ChatOptions): Promise<string>;
}
