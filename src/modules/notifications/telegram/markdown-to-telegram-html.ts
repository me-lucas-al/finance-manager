function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Converts the Markdown that LLMs tend to produce into the small HTML subset
// Telegram accepts (parse_mode=HTML). Everything is escaped first, so stray
// "<" or "&" in plain messages can never break the request.
export function markdownToTelegramHtml(markdown: string): string {
  const codeBlocks: string[] = [];
  const stash = (html: string) => `\u0000${codeBlocks.push(html) - 1}\u0000`;

  let text = markdown.replace(/```[^\n]*\n?([\s\S]*?)```/g, (_, code: string) =>
    stash(`<pre>${escapeHtml(code.replace(/\n$/, ''))}</pre>`),
  );
  text = text.replace(/`([^`\n]+)`/g, (_, code: string) => stash(`<code>${escapeHtml(code)}</code>`));

  text = escapeHtml(text);

  text = text
    .replace(/^[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$/gm, '')
    .replace(/^[ \t]*#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm, '<b>$1</b>')
    .replace(/^([ \t]*)[-*+][ \t]+/gm, '$1• ')
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<b>$1</b>')
    .replace(/__(?=\S)([\s\S]*?\S)__/g, '<b>$1</b>')
    .replace(/(?<![\w*])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![\w*])/g, '<i>$1</i>')
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text.replace(/\u0000(\d+)\u0000/g, (_, index: string) => codeBlocks[Number(index)]);
}
