'use server';

import { z } from 'zod';
import { requireUserId, requireOwnedEntity } from './require-session';
import { CreateIncomeUseCase, UpdateIncomeUseCase, DeleteIncomeUseCase } from '../../modules/finance/application/use-cases/manage-income';
import { CreateExpenseUseCase, UpdateExpenseUseCase, DeleteExpenseUseCase } from '../../modules/finance/application/use-cases/manage-expense';
import { CreateInvestmentUseCase, UpdateInvestmentUseCase, DeleteInvestmentUseCase } from '../../modules/finance/application/use-cases/manage-investment';
import { DrizzleIncomeRepository, DrizzleExpenseRepository, DrizzleInvestmentRepository } from '../../modules/finance/infrastructure/repositories';
import { ResolveCurrentPeriodUseCase } from '../../modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '../../modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '../../modules/users/infrastructure/repositories';

async function resolvePeriodId(userId: string, referenceDate: Date): Promise<string> {
  const useCase = new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), new DrizzleSettingRepository());
  const period = await useCase.execute(userId, referenceDate);
  return period.id;
}

// Schemas (no periodId/userId: those are resolved server-side, never trusted from the client)
const createIncomeSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  receivedAt: z.coerce.date(),
});

const updateIncomeSchema = createIncomeSchema.partial();

const createExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  date: z.coerce.date(),
});

const updateExpenseSchema = createExpenseSchema.partial();

const createInvestmentSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.string().min(1),
  date: z.coerce.date(),
});

const updateInvestmentSchema = createInvestmentSchema.partial();

// Incomes
export async function createIncome(formData: FormData) {
  const userId = await requireUserId();
  const parsedData = createIncomeSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = await resolvePeriodId(userId, parsedData.receivedAt);

  const useCase = new CreateIncomeUseCase(new DrizzleIncomeRepository());
  await useCase.execute({ ...parsedData, amount: parsedData.amount.toString(), userId, periodId });
}

export async function updateIncome(id: string, formData: FormData) {
  const userId = await requireUserId();
  const repo = new DrizzleIncomeRepository();
  await requireOwnedEntity(repo, id, userId);

  const parsedData = updateIncomeSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = parsedData.receivedAt ? await resolvePeriodId(userId, parsedData.receivedAt) : undefined;

  const useCase = new UpdateIncomeUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString(), periodId });
}

export async function deleteIncome(id: string) {
  const userId = await requireUserId();
  const repo = new DrizzleIncomeRepository();
  await requireOwnedEntity(repo, id, userId);

  const useCase = new DeleteIncomeUseCase(repo);
  await useCase.execute(id);
}

// Expenses
export async function createExpense(formData: FormData) {
  const userId = await requireUserId();
  const parsedData = createExpenseSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = await resolvePeriodId(userId, parsedData.date);

  const useCase = new CreateExpenseUseCase(new DrizzleExpenseRepository());
  await useCase.execute({ ...parsedData, amount: parsedData.amount.toString(), userId, periodId });
}

export async function updateExpense(id: string, formData: FormData) {
  const userId = await requireUserId();
  const repo = new DrizzleExpenseRepository();
  await requireOwnedEntity(repo, id, userId);

  const parsedData = updateExpenseSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = parsedData.date ? await resolvePeriodId(userId, parsedData.date) : undefined;

  const useCase = new UpdateExpenseUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString(), periodId });
}

export async function deleteExpense(id: string) {
  const userId = await requireUserId();
  const repo = new DrizzleExpenseRepository();
  await requireOwnedEntity(repo, id, userId);

  const useCase = new DeleteExpenseUseCase(repo);
  await useCase.execute(id);
}

// Investments
export async function createInvestment(formData: FormData) {
  const userId = await requireUserId();
  const parsedData = createInvestmentSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = await resolvePeriodId(userId, parsedData.date);

  const useCase = new CreateInvestmentUseCase(new DrizzleInvestmentRepository());
  await useCase.execute({ ...parsedData, amount: parsedData.amount.toString(), userId, periodId });
}

export async function updateInvestment(id: string, formData: FormData) {
  const userId = await requireUserId();
  const repo = new DrizzleInvestmentRepository();
  await requireOwnedEntity(repo, id, userId);

  const parsedData = updateInvestmentSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = parsedData.date ? await resolvePeriodId(userId, parsedData.date) : undefined;

  const useCase = new UpdateInvestmentUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString(), periodId });
}

export async function deleteInvestment(id: string) {
  const userId = await requireUserId();
  const repo = new DrizzleInvestmentRepository();
  await requireOwnedEntity(repo, id, userId);

  const useCase = new DeleteInvestmentUseCase(repo);
  await useCase.execute(id);
}
