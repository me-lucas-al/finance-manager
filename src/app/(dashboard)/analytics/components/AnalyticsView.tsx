'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getExpensesByCategory, getEvolutionData, getInvestmentsByType, getExpensesByDay } from '../analyticsUtils';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Expense } from '@/modules/expenses/domain/repositories/IExpenseRepository';
import { Income } from '@/modules/incomes/domain/repositories/IIncomeRepository';
import { Investment } from '@/modules/investments/domain/repositories/IInvestmentRepository';
import { FinancialPeriod } from '@/modules/periods/domain/repositories/IPeriodRepository';
import { UserSettings } from '@/modules/users/domain/repositories/IUserSettingsRepository';
import { Progress } from '@/components/ui/progress';

interface AnalyticsData {
  allPeriods: FinancialPeriod[];
  activePeriod: FinancialPeriod;
  settings: UserSettings;
  allExpenses: Expense[];
  allIncomes: Income[];
  allInvestments: Investment[];
}

const COLORS = ['#1e3a8a', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  if (!data || !data.activePeriod) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-gray-500">Nenhum dado disponível para exibir.</p>
      </div>
    );
  }

  // Current period data
  const currentExpenses = data.allExpenses.filter(e => e.periodId === data.activePeriod.id);
  const currentIncomes = data.allIncomes.filter(i => i.periodId === data.activePeriod.id);
  const currentInvestments = data.allInvestments.filter(i => i.periodId === data.activePeriod.id);

  const totalCurrentIncomes = currentIncomes.reduce((acc, curr) => acc + curr.amount, 0) / 100;
  const totalCurrentExpenses = currentExpenses.reduce((acc, curr) => acc + curr.amount, 0) / 100;
  const totalCurrentInvestments = currentInvestments.reduce((acc, curr) => acc + curr.amount, 0) / 100;

  // Chart 1: Gastos por categoria (Pie)
  const expensesByCategory = getExpensesByCategory(currentExpenses);

  // Chart 2: Evolução (Area)
  const evolutionData = getEvolutionData(data.allPeriods, data.allExpenses, data.allIncomes, data.allInvestments);

  // Chart 3 & 4: Limits & Goals (Progress bars & Text info)
  const maxExpenseLimit = totalCurrentIncomes * (data.settings.maxExpensesPercentage / 100);
  const minInvestmentTarget = totalCurrentIncomes * (data.settings.minInvestmentPercentage / 100);

  // Chart 5: Balance Evolution (Line)
  // Already in evolutionData.balance

  // Chart 6: Distribuição de investimentos (Pie)
  const investmentsByType = getInvestmentsByType(currentInvestments);

  // Chart 7: Gastos por dia (Bar)
  const expensesByDay = getExpensesByDay(currentExpenses);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        
        {/* Gastos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição de gastos no período atual</CardDescription>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">Sem gastos neste período</div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição dos Investimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Investimentos</CardTitle>
            <CardDescription>Tipos de investimentos no período atual</CardDescription>
          </CardHeader>
          <CardContent>
            {investmentsByType.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={investmentsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="type"
                  >
                    {investmentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">Sem investimentos neste período</div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-4 md:grid-cols-1">
        
        {/* Evolução de Receita, Gastos e Investimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Financeira</CardTitle>
            <CardDescription>Histórico de receitas, gastos e investimentos por período</CardDescription>
          </CardHeader>
          <CardContent>
            {evolutionData.length > 0 ? (
              <ChartContainer config={{
                incomes: { label: "Receitas", color: "#10b981" },
                expenses: { label: "Gastos", color: "#ef4444" },
                investments: { label: "Investimentos", color: "#1e3a8a" },
              }} className="h-[350px] w-full">
                <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncomes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="incomes" stroke="#10b981" fillOpacity={1} fill="url(#colorIncomes)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
                  <Area type="monotone" dataKey="investments" stroke="#1e3a8a" fill="transparent" />
                </AreaChart>
              </ChartContainer>
            ) : (
               <div className="flex h-[350px] items-center justify-center text-sm text-gray-500">Sem dados históricos</div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Evolução do Saldo */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Saldo Livre</CardTitle>
            <CardDescription>Como o saldo disponível evoluiu ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
             {evolutionData.length > 0 ? (
              <ChartContainer config={{ balance: { label: "Saldo", color: "#1e3a8a" } }} className="h-[300px] w-full">
                <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="balance" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
             ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">Sem dados históricos</div>
             )}
          </CardContent>
        </Card>

        {/* Gastos por dia */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Dia</CardTitle>
            <CardDescription>Valores gastos diariamente no período atual</CardDescription>
          </CardHeader>
          <CardContent>
             {expensesByDay.length > 0 ? (
              <ChartContainer config={{ amount: { label: "Gastos", color: "#ef4444" } }} className="h-[300px] w-full">
                <BarChart data={expensesByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
             ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">Sem gastos neste período</div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Limites e Metas (Gráfico de Barras horizontais customizado ou Progress) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos vs Limite</CardTitle>
            <CardDescription>Limite de gastos configurado para o período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-black">Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCurrentExpenses)}</span>
                <span className="text-gray-500">Limite: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(maxExpenseLimit)}</span>
              </div>
              <Progress 
                value={maxExpenseLimit > 0 ? (totalCurrentExpenses / maxExpenseLimit) * 100 : 0} 
                className="h-4"
                indicatorClassName={totalCurrentExpenses > maxExpenseLimit ? "bg-red-600" : "bg-blue-900"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investimentos vs Meta</CardTitle>
            <CardDescription>Meta de investimentos configurada para o período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-black">Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCurrentInvestments)}</span>
                <span className="text-gray-500">Meta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(minInvestmentTarget)}</span>
              </div>
              <Progress 
                value={minInvestmentTarget > 0 ? (totalCurrentInvestments / minInvestmentTarget) * 100 : 0} 
                className="h-4"
                indicatorClassName="bg-green-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
