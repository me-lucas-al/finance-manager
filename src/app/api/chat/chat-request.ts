type MessagePart = { type?: string; text?: string };
type IncomingMessage = { role?: string; content?: string; parts?: MessagePart[] };

function textOf(message: IncomingMessage): string {
  if (message.content) return message.content;
  return (message.parts ?? [])
    .filter((part): part is MessagePart & { text: string } => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n');
}

export function extractLastUserText(messages: unknown): string | null {
  if (!Array.isArray(messages)) return null;
  const lastUserMessage = [...(messages as IncomingMessage[])].reverse().find((message) => message?.role === 'user');
  const text = lastUserMessage ? textOf(lastUserMessage).trim() : '';
  return text || null;
}
