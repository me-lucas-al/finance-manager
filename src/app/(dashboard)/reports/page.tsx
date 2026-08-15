import React from 'react';

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h3 className="tracking-tight text-sm font-medium mb-4">Filters</h3>
          <div className="flex gap-4">
            <select className="border rounded p-2 text-sm bg-white dark:bg-slate-900">
              <option>Current Period</option>
              <option>Last Period</option>
              <option>All Time</option>
            </select>
            <input type="date" className="border rounded p-2 text-sm bg-white dark:bg-slate-900" />
            <input type="date" className="border rounded p-2 text-sm bg-white dark:bg-slate-900" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="tracking-tight text-sm font-medium">Total Income</h3>
            <div className="text-2xl font-bold mt-2">R$ 0,00</div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="tracking-tight text-sm font-medium">Total Expenses</h3>
            <div className="text-2xl font-bold mt-2">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">0% spent</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="tracking-tight text-sm font-medium">Total Investments</h3>
            <div className="text-2xl font-bold mt-2">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">0% invested</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="tracking-tight text-sm font-medium">Balance</h3>
            <div className="text-2xl font-bold mt-2">R$ 0,00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
