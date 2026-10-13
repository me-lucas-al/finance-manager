import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractLastUserText } from '@/app/api/chat/chat-request';

const authMock = vi.fn();
vi.mock('@/auth', () => ({ auth: authMock }));

const streamMock = vi.fn();
vi.mock('@/modules/ai/infrastructure/build-advisor-services', () => ({
  buildAdvisorServices: () => ({ advisorChat: { stream: streamMock } }),
}));

const findRecentMock = vi.fn();
const deleteAllMock = vi.fn();
vi.mock('@/modules/ai/infrastructure/supabase-chat-message-repository', () => ({
  SupabaseChatMessageRepository: class {
    findRecentByUserId = findRecentMock;
    deleteAllByUserId = deleteAllMock;
  },
}));

const { POST } = await import('@/app/api/chat/route');
const history = await import('@/app/api/chat/history/route');

const chatRequest = (messages: unknown) =>
  new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({ messages }) });

async function* chunks(...parts: string[]) {
  for (const part of parts) yield part;
}

describe('extractLastUserText', () => {
  it('reads content or text parts of the last user message', () => {
    expect(extractLastUserText([{ role: 'user', content: 'oi' }, { role: 'assistant', content: 'olá' }])).toBe('oi');
    expect(extractLastUserText([{ role: 'user', parts: [{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }] }])).toBe('a\nb');
  });

  it('returns null for empty or invalid payloads', () => {
    expect(extractLastUserText(undefined)).toBeNull();
    expect(extractLastUserText([{ role: 'assistant', content: 'x' }])).toBeNull();
    expect(extractLastUserText([{ role: 'user', content: '   ' }])).toBeNull();
  });
});

describe('chat routes', () => {
  beforeEach(() => {
    authMock.mockReset();
    streamMock.mockReset();
    findRecentMock.mockReset();
    deleteAllMock.mockReset();
    delete process.env.FINANCE_OWNER_USER_ID;
  });

  it('rejects requests without a session', async () => {
    authMock.mockResolvedValue(null);

    expect((await POST(chatRequest([{ role: 'user', content: 'oi' }]))).status).toBe(401);
    expect((await history.GET()).status).toBe(401);
    expect((await history.DELETE()).status).toBe(401);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('rejects an unreadable body', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });

    const response = await POST(new Request('http://localhost/api/chat', { method: 'POST', body: 'not json' }));

    expect(response.status).toBe(400);
  });

  it('rejects an empty message', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });

    expect((await POST(chatRequest([{ role: 'user', content: ' ' }]))).status).toBe(400);
  });

  it('streams the advisor reply for the web channel', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    streamMock.mockReturnValue(chunks('Olá, ', 'mundo'));

    const response = await POST(chatRequest([{ role: 'user', parts: [{ type: 'text', text: 'oi' }] }]));
    const body = await response.text();

    expect(streamMock).toHaveBeenCalledWith('u1', 'oi', 'web');
    expect(body).toContain('"type":"text-delta"');
    expect(body).toContain('Olá, ');
    expect(body).toContain('mundo');
  });

  it('returns only user and assistant history and clears it on delete', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    findRecentMock.mockResolvedValue([
      { id: '1', role: 'summary', content: 's', channel: 'telegram' },
      { id: '2', role: 'user', content: 'oi', channel: 'telegram' },
      { id: '3', role: 'assistant', content: 'olá', channel: 'web' },
    ]);

    const body = await (await history.GET()).json();
    expect(body.messages.map((message: { id: string }) => message.id)).toEqual(['2', '3']);

    await history.DELETE();
    expect(deleteAllMock).toHaveBeenCalledWith('u1');
  });
});
