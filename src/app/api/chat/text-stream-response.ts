import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';

const TEXT_PART_ID = 'reply';
const STREAM_ERROR_MESSAGE = 'Não consegui responder agora. Tente novamente em instantes.';

export function textStreamToUIResponse(chunks: AsyncIterable<string>): Response {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'text-start', id: TEXT_PART_ID });
      for await (const delta of chunks) writer.write({ type: 'text-delta', id: TEXT_PART_ID, delta });
      writer.write({ type: 'text-end', id: TEXT_PART_ID });
    },
    onError: (error) => {
      console.error('Advisor stream failed:', error);
      return STREAM_ERROR_MESSAGE;
    },
  });
  return createUIMessageStreamResponse({ stream });
}
