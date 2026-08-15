import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder for charts */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Expenses by Category</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              Chart Loading...
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-2">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Evolution (Income vs Expenses vs Investments)</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              Chart Loading...
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Investments vs Target</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              Empty State
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
