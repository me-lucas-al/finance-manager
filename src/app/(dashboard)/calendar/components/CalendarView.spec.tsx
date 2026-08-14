import { render, screen } from '@testing-library/react';
import { CalendarView } from './CalendarView';
import { addDays } from 'date-fns';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('CalendarView', () => {
  it('renders the active period correctly', () => {
    const today = new Date();
    const startDate = addDays(today, -10);
    const endDate = addDays(today, 5);

    const periods = [
      {
        id: '1',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'open' as const,
      }
    ];

    const settings = {
      periodStartDay: 1,
      periodEndDay: 30,
    };

    render(<CalendarView periods={periods} activePeriod={periods[0]} settings={settings} />);

    expect(screen.getByText('Visão do Período')).toBeInTheDocument();
    expect(screen.getByText(/Dia de fechamento configurado:/)).toHaveTextContent('Dia de fechamento configurado: 30');
    expect(screen.getByText('Período Atual')).toBeInTheDocument();
    
    // Remaining days
    expect(screen.getByText(/dias/)).toBeInTheDocument();
  });

  it('renders past periods correctly', () => {
    const periods = [
      {
        id: '1',
        startDate: new Date('2026-07-01').toISOString(),
        endDate: new Date('2026-07-31').toISOString(),
        status: 'closed' as const,
      }
    ];

    render(<CalendarView periods={periods} activePeriod={undefined} settings={{ periodStartDay: 1, periodEndDay: 31 }} />);

    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(screen.getAllByText(/26/).length).toBeGreaterThan(0);
    expect(screen.getByText('Fechado')).toBeInTheDocument();
  });
});
