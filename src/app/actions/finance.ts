'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { requireUserId, requireOwnedEntity } from './require-session';
import { CreateIncomeUseCase, UpdateIncomeUseCase, DeleteIncomeUseCase } from '../../modules/finance/application/use-cases/manage-income';
import { CreateInvestmentUseCase, UpdateInvestmentUseCase, DeleteInvestmentUseCase } from '../../modules/finance/application/use-cases/manage-investment';
import { DrizzleIncomeRepository, DrizzleInvestmentRepository } from '../../modules/finance/infrastructure/repositories';
import type { IncomeSortField } from '../../modules/finance/domain/repositories/income-repository';
import type { InvestmentSortField } from '../../modules/finance/domain/repositories/investment-repository';
import { ResolveCurrentPeriodUseCase } from '../../modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '../../modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '../../modules/users/infrastructure/repositories';
import { PAGE_SIZE } from '../../components/entries/constants';

export type EntryListParams = {
  search?: string;
  category?: string;
  sort?: 'date' | 'description' | 'amount';
  dir?: 'asc' | 'desc';
  page: number;
};

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

  updateTag(`incomes-${userId}`);
}

export async function updateIncome(id: string, formData: FormData) {
  const userId = await requireUserId();
  const repo = new DrizzleIncomeRepository();
  await requireOwnedEntity(repo, id, userId);

  const parsedData = updateIncomeSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = parsedData.receivedAt ? await resolvePeriodId(userId, parsedData.receivedAt) : undefined;

  const useCase = new UpdateIncomeUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString(), periodId });

  updateTag(`incomes-${userId}`);
}

export async function deleteIncome(id: string) {
  const userId = await requireUserId();
  const repo = new DrizzleIncomeRepository();
  await requireOwnedEntity(repo, id, userId);

  const useCase = new DeleteIncomeUseCase(repo);
  await useCase.execute(id);

  updateTag(`incomes-${userId}`);
}

// Investments
export async function createInvestment(formData: FormData) {
  const userId = await requireUserId();
  const parsedData = createInvestmentSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = await resolvePeriodId(userId, parsedData.date);

  const useCase = new CreateInvestmentUseCase(new DrizzleInvestmentRepository());
  await useCase.execute({ ...parsedData, amount: parsedData.amount.toString(), userId, periodId });

  updateTag(`investments-${userId}`);
}

export async function updateInvestment(id: string, formData: FormData) {
  const userId = await requireUserId();
  const repo = new DrizzleInvestmentRepository();
  await requireOwnedEntity(repo, id, userId);

  const parsedData = updateInvestmentSchema.parse(Object.fromEntries(formData.entries()));
  const periodId = parsedData.date ? await resolvePeriodId(userId, parsedData.date) : undefined;

  const useCase = new UpdateInvestmentUseCase(repo);
  await useCase.execute(id, { ...parsedData, amount: parsedData.amount?.toString(), periodId });

  updateTag(`investments-${userId}`);
}

export async function deleteInvestment(id: string) {
  const userId = await requireUserId();
  const repo = new DrizzleInvestmentRepository();
  await requireOwnedEntity(repo, id, userId);

  const useCase = new DeleteInvestmentUseCase(repo);
  await useCase.execute(id);

  updateTag(`investments-${userId}`);
}

// Reads

function normalizeParams(params: EntryListParams) {
  return {
    search: params.search ?? '',
    category: params.category ?? '',
    sort: params.sort ?? 'date',
    dir: params.dir ?? 'desc',
    page: params.page,
  };
}

async function fetchIncomesPageCached(
  userId: string,
  params: { search: string; category: string; sort: IncomeSortField; dir: 'asc' | 'desc'; page: number }
) {
  'use cache';
  const { cacheTag, cacheLife } = await import('next/cache');
  cacheTag(`incomes-${userId}`);
  cacheLife('max');

  const repo = new DrizzleIncomeRepository();
  return repo.findPageByUserId(userId, {
    search: params.search || undefined,
    category: params.category || undefined,
    sort: params.sort,
    dir: params.dir,
    limit: PAGE_SIZE,
    offset: (params.page - 1) * PAGE_SIZE,
  });
}

export async function getIncomesPage(params: EntryListParams) {
  const userId = await requireUserId();
  return fetchIncomesPageCached(userId, normalizeParams(params));
}

async function fetchInvestmentsPageCached(
  userId: string,
  params: { search: string; category: string; sort: InvestmentSortField; dir: 'asc' | 'desc'; page: number }
) {
  'use cache';
  const { cacheTag, cacheLife } = await import('next/cache');
  cacheTag(`investments-${userId}`);
  cacheLife('max');

  const repo = new DrizzleInvestmentRepository();
  return repo.findPageByUserId(userId, {
    search: params.search || undefined,
    type: params.category || undefined,
    sort: params.sort,
    dir: params.dir,
    limit: PAGE_SIZE,
    offset: (params.page - 1) * PAGE_SIZE,
  });
}

export async function getInvestmentsPage(params: EntryListParams) {
  const userId = await requireUserId();
  return fetchInvestmentsPageCached(userId, normalizeParams(params));
}
