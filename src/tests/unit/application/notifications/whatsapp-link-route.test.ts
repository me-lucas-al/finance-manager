import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PairingEvent } from '@/modules/notifications/whatsapp/domain/whatsapp-pairing';

const auth = vi.fn();
const execute = vi.fn();

vi.mock('@/auth', () => ({ auth }));
vi.mock('@/composition/whatsapp', () => ({ linkWhatsapp: { execute } }));

async function* emit(events: PairingEvent[]) {
  yield* events;
}

const readFrames = async (response: Response): Promise<object[]> => {
  const text = await response.text();
  return text
    .split('\n\n')
    .filter(Boolean)
    .map((frame) => JSON.parse(frame.replace(/^data: /, '')));
};

describe('WhatsApp link route', () => {
  beforeEach(() => {
    auth.mockReset();
    execute.mockReset();
  });

  it('rejects requests without a session', async () => {
    auth.mockResolvedValue(null);
    const { GET } = await import('@/app/api/whatsapp/link/route');

    const response = await GET(new Request('http://localhost/api/whatsapp/link'));

    expect(response.status).toBe(401);
    expect(execute).not.toHaveBeenCalled();
  });

  it('streams the QR as an image and the connection result', async () => {
    auth.mockResolvedValue({ user: { id: 'u1' } });
    execute.mockReturnValue(emit([{ type: 'qr', qr: '2@abc' }, { type: 'connected', jid: 'x@s.whatsapp.net' }]));
    const { GET } = await import('@/app/api/whatsapp/link/route');

    const response = await GET(new Request('http://localhost/api/whatsapp/link'));
    const frames = await readFrames(response);

    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(execute).toHaveBeenCalledWith('u1', expect.any(AbortSignal));
    expect(frames[0]).toMatchObject({ type: 'qr', image: expect.stringContaining('data:image/png;base64,') });
    expect(frames[1]).toMatchObject({ type: 'connected' });
  });

  it('turns a pairing crash into a failed event', async () => {
    auth.mockResolvedValue({ user: { id: 'u1' } });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    execute.mockReturnValue(
      (async function* () {
        yield* [] as PairingEvent[];
        throw new Error('socket exploded');
      })(),
    );
    const { GET } = await import('@/app/api/whatsapp/link/route');

    const frames = await readFrames(await GET(new Request('http://localhost/api/whatsapp/link')));

    expect(frames).toEqual([{ type: 'failed', reason: 'Não foi possível conectar o WhatsApp.' }]);
  });
});

describe('pairing event stream cancel', () => {
  it('tells the caller when the client goes away and stops writing', async () => {
    const { pairingEventStream } = await import('@/app/api/whatsapp/link/pairing-event-stream');
    const onCancel = vi.fn();
    const stream = pairingEventStream(
      (async function* () {
        yield { type: 'qr', qr: 'a' } as PairingEvent;
        yield { type: 'qr', qr: 'b' } as PairingEvent;
      })(),
      onCancel,
    );

    const reader = stream.getReader();
    await reader.read();
    await reader.cancel();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
