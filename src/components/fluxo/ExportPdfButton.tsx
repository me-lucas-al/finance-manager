import { FileDown } from 'lucide-react';

export function ExportPdfButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      download
      className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-white"
    >
      <FileDown className="h-4 w-4" />
      Exportar PDF
    </a>
  );
}
