'use client';

import { useState } from 'react';
import { Landmark, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';
import { DATA_MODE_LABELS, oppositeMode } from './data-mode-labels';
import { SwitchDataModeDialog } from './SwitchDataModeDialog';

export function DataSourceCard({ currentMode }: { currentMode: DataMode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const targetMode = oppositeMode(currentMode);
  const CurrentIcon = currentMode === 'manual' ? PencilLine : Landmark;

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Fonte de dados</CardTitle>
        <CardDescription>De onde vêm seus lucros, despesas e investimentos.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CurrentIcon className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-medium text-white">{DATA_MODE_LABELS[currentMode].name}</p>
            <p className="text-xs text-zinc-400">{DATA_MODE_LABELS[currentMode].description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setDialogOpen(true)} data-testid="switch-data-mode">
          Mudar para {DATA_MODE_LABELS[targetMode].name}
        </Button>
      </CardContent>

      <SwitchDataModeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentMode={currentMode}
        targetMode={targetMode}
      />
    </Card>
  );
}
