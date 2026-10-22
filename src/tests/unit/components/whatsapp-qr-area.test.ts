import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { WhatsappQrArea } from '@/components/whatsapp/WhatsappQrArea';
import type { PairingStatus } from '@/components/whatsapp/useWhatsappPairing';

const render = (status: PairingStatus, qrImage: string | null = null, error: string | null = null) =>
  renderToStaticMarkup(createElement(WhatsappQrArea, { status, qrImage, error, onRetry: () => undefined }));

describe('WhatsappQrArea', () => {
  it('shows a loading message while the code is being generated', () => {
    expect(render('starting')).toContain('Gerando QR code...');
  });

  it('shows the QR image once it arrives', () => {
    const html = render('qr', 'data:image/png;base64,AAAA');

    expect(html).toContain('alt="QR code para conectar o WhatsApp"');
    expect(html).not.toContain('Gerando QR code');
  });

  it('shows the error and a button to get a new code', () => {
    const html = render('failed', null, 'Conexão interrompida');

    expect(html).toContain('Conexão interrompida');
    expect(html).toContain('Gerar novo código');
  });

  it('confirms the connection', () => {
    expect(render('connected')).toContain('WhatsApp conectado!');
  });
});

describe('WhatsappQrArea states', () => {
  it('stays empty while idle instead of showing the loading message', () => {
    const html = render('idle');

    expect(html).not.toContain('Gerando QR code');
    expect(html).not.toContain('Gerar novo código');
  });

  it('marks errors as alerts and progress as status', () => {
    expect(render('failed', null, 'x')).toContain('role="alert"');
    expect(render('starting')).toContain('role="status"');
  });
});
