import { describe, it, expect } from 'vitest';
import { markdownToTelegramHtml } from '@/modules/notifications/telegram/markdown-to-telegram-html';

describe('markdownToTelegramHtml', () => {
  it('converts bold, bullets, headings and removes horizontal rules', () => {
    const input = [
      '📊 **Resumo de Outubro/2026:**',
      '- **Entradas:** R$ 0,00',
      '* **Saídas:** R$ 0,00',
      '',
      '---',
      '',
      '## Próximos passos',
      '1. **Registrar:** me avise (ex: *"Gastei R$ 150"*)',
    ].join('\n');

    expect(markdownToTelegramHtml(input)).toBe(
      [
        '📊 <b>Resumo de Outubro/2026:</b>',
        '• <b>Entradas:</b> R$ 0,00',
        '• <b>Saídas:</b> R$ 0,00',
        '',
        '<b>Próximos passos</b>',
        '1. <b>Registrar:</b> me avise (ex: <i>"Gastei R$ 150"</i>)',
      ].join('\n'),
    );
  });

  it('escapes html in plain text', () => {
    expect(markdownToTelegramHtml('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });

  it('keeps code spans literal and escaped', () => {
    expect(markdownToTelegramHtml('use `a<b` e **negrito**')).toBe('use <code>a&lt;b</code> e <b>negrito</b>');
  });

  it('does not treat a lone asterisk or snake_case as formatting', () => {
    expect(markdownToTelegramHtml('2 * 3 e meu_nome_aqui')).toBe('2 * 3 e meu_nome_aqui');
  });
});
