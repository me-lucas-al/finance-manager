import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { periodSnapshots } from '@/db/schema';
import type { PeriodSnapshot } from '../domain/models/period-snapshot';
import type { PeriodSnapshotRepository } from '../domain/repositories/period-snapshot-repository';

export class DrizzlePeriodSnapshotRepository implements PeriodSnapshotRepository {
  async findByIdAndUserId(snapshotId: string, userId: string): Promise<PeriodSnapshot | null> {
    const [snapshot] = await db
      .select()
      .from(periodSnapshots)
      .where(and(eq(periodSnapshots.id, snapshotId), eq(periodSnapshots.userId, userId)));
    return snapshot ?? null;
  }
}
