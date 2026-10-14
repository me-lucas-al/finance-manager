export function SectionSkeleton({ height }: { height: string }) {
  return <div className={`${height} w-full rounded-2xl bg-zinc-900/60 animate-pulse`} />;
}
