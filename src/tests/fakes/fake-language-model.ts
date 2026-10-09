import {
  ILanguageModel,
  LanguageModelMessage,
  ChatOptions,
} from '../../modules/ai/domain/models/language-model';

export class FakeLanguageModel implements ILanguageModel {
  public lastPrompt: string = '';
  public lastMessages: LanguageModelMessage[] = [];
  public nextTextResponse: string = 'Resposta simulada da IA';
  public nextStructuredResponse: unknown = null;

  async generateText(prompt: string): Promise<string> {
    this.lastPrompt = prompt;
    return this.nextTextResponse;
  }

  async generateStructured<T>(prompt: string): Promise<T> {
    this.lastPrompt = prompt;
    if (this.nextStructuredResponse !== null) {
      return this.nextStructuredResponse as T;
    }
    return JSON.parse(this.nextTextResponse) as T;
  }

  async chat(messages: LanguageModelMessage[], options?: ChatOptions): Promise<string> {
    this.lastMessages = messages;
    if (options?.tools && options.tools.length > 0 && this.nextStructuredResponse) {
      const toolCall = this.nextStructuredResponse as { name: string; args: Record<string, unknown> };
      const matchingTool = options.tools.find((t) => t.name === toolCall.name);
      if (matchingTool) {
        await matchingTool.execute(toolCall.args);
      }
    }
    return this.nextTextResponse;
  }
}
