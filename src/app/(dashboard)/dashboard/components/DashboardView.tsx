'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  WalletIcon, 
  TrendingUpIcon, 
  CalendarIcon, 
  AlertCircleIcon, 
  CheckCircle2Icon 
} from 'lucide-react';

interface DashboardData {
  totalIncomes: number;
  totalExpenses: number;
  totalInvestments: number;
  balance: number;
  expensePercentage: number;
  investmentPercentage: number;
  availableExpenseLimit: number;
  remainingInvestmentAmount: number;
  statusText: string;
  statusVariant: 'default' | 'destructive' | 'warning' | 'success';
  statusMessage: string;
  daysRemaining: number;
  periodStart: Date;
  periodEnd: Date;
  settings: {
    maxExpensesPercentage: number;
    minInvestmentPercentage: number;
  };
}

export function DashboardView({ data }: { data: DashboardData }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusIcon = () => {
    if (data.statusVariant === 'destructive') return <AlertCircleIcon className="w-5 h-5 text-red-600" />;
    if (data.statusVariant === 'warning') return <AlertCircleIcon className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle2Icon className="w-5 h-5 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Top row: Status and Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Receita */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
            <ArrowUpIcon className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{formatCurrency(data.totalIncomes)}</div>
            <p className="text-xs text-gray-500 mt-1">Período atual</p>
          </CardContent>
        </Card>

        {/* Total Gasto */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">Total Gasto</CardTitle>
            <ArrowDownIcon className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{formatCurrency(data.totalExpenses)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.expensePercentage.toFixed(1)}% de gastos (Limite: {data.settings.maxExpensesPercentage}%)
            </p>
          </CardContent>
        </Card>

        {/* Total Investido */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">Total Investido</CardTitle>
            <TrendingUpIcon className="w-4 h-4 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{formatCurrency(data.totalInvestments)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.investmentPercentage.toFixed(1)}% investido (Meta: {data.settings.minInvestmentPercentage}%)
            </p>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card className="border-gray-200 shadow-sm bg-blue-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-200">Saldo Livre</CardTitle>
            <WalletIcon className="w-4 h-4 text-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.balance)}</div>
            <p className="text-xs text-gray-300 mt-1">
              Após gastos e investimentos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Metas e Limites */}
        <Card className="col-span-4 border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black">Acompanhamento de Metas</CardTitle>
            <CardDescription>Resumo do seu progresso no período atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Limite de Gastos ({data.settings.maxExpensesPercentage}%)</span>
                <span className="text-gray-500">{formatCurrency(data.totalExpenses)} / {formatCurrency(data.totalIncomes * (data.settings.maxExpensesPercentage / 100))}</span>
              </div>
              <Progress 
                value={(data.expensePercentage / data.settings.maxExpensesPercentage) * 100} 
                className="h-2"
                indicatorClassName={data.expensePercentage > data.settings.maxExpensesPercentage ? "bg-red-600" : "bg-blue-900"}
              />
              <p className="text-xs text-gray-500 mt-2">
                Limite disponível: <span className="font-semibold text-black">{formatCurrency(data.availableExpenseLimit)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Meta de Investimentos ({data.settings.minInvestmentPercentage}%)</span>
                <span className="text-gray-500">{formatCurrency(data.totalInvestments)} / {formatCurrency(data.totalIncomes * (data.settings.minInvestmentPercentage / 100))}</span>
              </div>
              <Progress 
                value={(data.investmentPercentage / data.settings.minInvestmentPercentage) * 100} 
                className="h-2"
                indicatorClassName="bg-green-600"
              />
              <p className="text-xs text-gray-500 mt-2">
                Falta investir: <span className="font-semibold text-black">{formatCurrency(data.remainingInvestmentAmount)}</span>
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Status e Período */}
        <Card className="col-span-3 border-gray-200 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-black">Status Geral</CardTitle>
            <CardDescription>Resumo de integridade da sua saúde financeira</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-start space-x-4 p-4 border rounded-lg bg-gray-50">
              <div className="mt-1">
                {getStatusIcon()}
              </div>
              <div>
                <h4 className="font-medium text-black">{data.statusText}</h4>
                <p className="text-sm text-gray-600 mt-1">{data.statusMessage}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
              <CalendarIcon className="w-8 h-8 text-blue-900" />
              <div>
                <h4 className="font-medium text-black">{data.daysRemaining} dias restantes</h4>
                <p className="text-sm text-gray-600 mt-1">Fechamento em {new Date(data.periodEnd).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
