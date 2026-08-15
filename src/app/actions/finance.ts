'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { getSession } from '../../modules/auth/application/session';
import { CreateIncomeUseCase, UpdateIncomeUseCase, DeleteIncomeUseCase } from '../../modules/finance/application/use-cases/manage-income';
import { CreateExpenseUseCase, UpdateExpenseUseCase, DeleteExpenseUseCase } from '../../modules/finance/application/use-cases/manage-expense';
import { CreateInvestmentUseCase, UpdateInvestmentUseCase, DeleteInvestmentUseCase } from '../../modules/finance/application/use-cases/manage-investment';
import { DrizzleIncomeRepository, DrizzleExpenseRepository, DrizzleInvestmentRepository } from '../../modules/finance/infrastructure/repositories';

// Schemas
const createIncomeSchema = z.object({
  periodId: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  receivedAt: z.coerce.date(),
});

const updateIncomeSchema = createIncomeSchema.partial();

const createExpenseSchema = z.object({
  periodId: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  date: z.coerce.date(),
});

const updateExpenseSchema = createExpenseSchema.partial();

const createInvestmentSchema = z.object({
  periodId: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.string().min(1),
  date: z.coerce.date(),
});

const updateInvestmentSchema = createInvestmentSchema.partial();

// Incomes
export async function createIncome(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = createIncomeSchema.parse(rawData);

  const useCase = new CreateIncomeUseCase(new DrizzleIncomeRepository());
  await useCase.execute({ ...parsedData, amount: parsedData.amount.toString(), userId: session.user.id });

  revalidateTag(`finance-${session.user.id}`, 'max');
}

export async function updateIncome(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const repo = new DrizzleIncomeRepository();
  const existing = await repo.findById(id);
  if (!existing || existing.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = updateIncomeSchema.parse(rawData);

  const useCase = new UpdateIncomeUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString() });

  revalidateTag(`finance-${session.user.id}`, 'max');
}

export async function deleteIncome(id: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const repo = new DrizzleIncomeRepository();
  const existing = await repo.findById(id);
  if (!existing || existing.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const useCase = new DeleteIncomeUseCase(repo);
  await useCase.execute(id);

  revalidateTag(`finance-${session.user.id}`, 'max');
}

// Expenses
export async function createExpense(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = createExpenseSchema.parse(rawData);

  const useCase = new CreateExpenseUseCase(new DrizzleExpenseRepository());
  await useCase.execute({ ...parsedData, amount: parsedData.amount.toString(), userId: session.user.id });

  revalidateTag(`finance-${session.user.id}`, 'max');
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const repo = new DrizzleExpenseRepository();
  const existing = await repo.findById(id);
  if (!existing || existing.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = updateExpenseSchema.parse(rawData);

  const useCase = new UpdateExpenseUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString() });

  revalidateTag(`finance-${session.user.id}`, 'max');
}

export async function deleteExpense(id: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const repo = new DrizzleExpenseRepository();
  const existing = await repo.findById(id);
  if (!existing || existing.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const useCase = new DeleteExpenseUseCase(repo);
  await useCase.execute(id);

  revalidateTag(`finance-${session.user.id}`, 'max');
}

// Investments
export async function createInvestment(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = createInvestmentSchema.parse(rawData);

  const useCase = new CreateInvestmentUseCase(new DrizzleInvestmentRepository());
  await useCase.execute({ ...parsedData, amount: parsedData.amount.toString(), userId: session.user.id });

  revalidateTag(`finance-${session.user.id}`, 'max');
}

export async function updateInvestment(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const repo = new DrizzleInvestmentRepository();
  const existing = await repo.findById(id);
  if (!existing || existing.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = updateInvestmentSchema.parse(rawData);

  const useCase = new UpdateInvestmentUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString() });

  revalidateTag(`finance-${session.user.id}`, 'max');
}

export async function deleteInvestment(id: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const repo = new DrizzleInvestmentRepository();
  const existing = await repo.findById(id);
  if (!existing || existing.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const useCase = new DeleteInvestmentUseCase(repo);
  await useCase.execute(id);

  revalidateTag(`finance-${session.user.id}`, 'max');
}
