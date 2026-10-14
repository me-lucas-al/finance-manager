import type { Components } from 'react-markdown';

export const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-purple-300">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-black/40 border border-white/5 p-3 text-xs font-mono">
      {children}
    </pre>
  ),
  h1: ({ children }) => <h1 className="mb-2 text-base font-semibold text-white">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 text-sm font-semibold text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 text-sm font-medium text-zinc-200">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-purple-500/50 pl-3 text-zinc-400 italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
};
