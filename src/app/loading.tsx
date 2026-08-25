export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="h-8 w-64 bg-muted rounded animate-pulse mb-8"></div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="p-6 pt-0">
              <div className="h-8 w-32 bg-muted rounded animate-pulse mt-2"></div>
              <div className="h-3 w-48 bg-muted rounded animate-pulse mt-4"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
            <div className="h-2 w-full bg-muted rounded-full mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
