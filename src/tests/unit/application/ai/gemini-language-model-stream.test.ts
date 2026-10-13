import { describe, it, expect, vi, beforeEach } from 'vitest';

const streamTextMock = vi.fn();

vi.mock('ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('ai')>()),
  streamText: streamTextMock,
}));

const { GeminiLanguageModel } = await import('@/modules/ai/infrastructure/gemini-language-model');

async function* parts(...items: Array<Record<string, unknown>>) {
  for (const item of items) yield item;
}

async function collect(stream: AsyncIterable<string>): Promise<string[]> {
  const chunks: string[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return chunks;
}

describe('GeminiLanguageModel.stream', () => {
  beforeEach(() => streamTextMock.mockReset());

  it('yields only text deltas', async () => {
    streamTextMock.mockReturnValue({
      fullStream: parts(
        { type: 'start-step' },
        { type: 'text-delta', text: 'Olá' },
        { type: 'tool-call' },
        { type: 'text-delta', text: ' mundo' },
        { type: 'finish-step' }
      ),
    });

    const chunks = await collect(new GeminiLanguageModel().stream([{ role: 'user', content: 'oi' }]));

    expect(chunks).toEqual(['Olá', ' mundo']);
  });

  it('separates the text of different steps', async () => {
    streamTextMock.mockReturnValue({
      fullStream: parts(
        { type: 'start-step' },
        { type: 'text-delta', text: 'Vou buscar.' },
        { type: 'start-step' },
        { type: 'text-delta', text: 'Encontrei.' }
      ),
    });

    const chunks = await collect(new GeminiLanguageModel().stream([{ role: 'user', content: 'oi' }]));

    expect(chunks.join('')).toBe('Vou buscar.\n\nEncontrei.');
  });

  it('throws when the provider reports an error instead of ending silently', async () => {
    streamTextMock.mockReturnValue({
      fullStream: parts({ type: 'text-delta', text: 'Olá' }, { type: 'error', error: new Error('quota exceeded') }),
    });

    await expect(collect(new GeminiLanguageModel().stream([{ role: 'user', content: 'oi' }]))).rejects.toThrow('quota exceeded');
  });
});
