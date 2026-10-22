import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';

const render = (connected: boolean) => renderToStaticMarkup(createElement(ConnectionBadge, { connected }));

describe('ConnectionBadge', () => {
  it('shows a green dot and the connected label', () => {
    const html = render(true);

    expect(html).toContain('Conectado');
    expect(html).not.toContain('Desconectado');
    expect(html).toContain('bg-emerald-400');
  });

  it('shows a red dot and the disconnected label', () => {
    const html = render(false);

    expect(html).toContain('Desconectado');
    expect(html).toContain('bg-red-500');
    expect(html).not.toContain('bg-emerald-400');
  });

  it('announces the state as a status region', () => {
    expect(render(true)).toContain('role="status"');
  });
});
