import type { ZodType } from 'zod';
import type { SpendingAlert } from '../../domain/models/spending-patterns';
import type { EntryChanges, EntryRef } from '../../domain/models/entry-changes';
import type { ParsedEntry } from '../../domain/parsers/parse-entry-message';
import { createEntrySchema, deleteEntrySchema, updateEntrySchema } from '../schemas/entry-action-schemas';
import { describeEntryActionFailure } from './describe-entry-action-failure';

export type EntryActionResult =
  | { ok: true; alerts: SpendingAlert[] }
  | { ok: false; error: string };

export type EntryActionPorts = {
  resolveUserId: () => Promise<string>;
  registerEntry: { execute(userId: string, entry: ParsedEntry): Promise<{ alerts: SpendingAlert[] }> };
  updateEntry: { execute(userId: string, ref: EntryRef, changes: EntryChanges): Promise<void> };
  deleteEntry: { execute(userId: string, ref: EntryRef): Promise<void> };
  reportUnexpectedError: (error: unknown) => void;
};

export class EntryActionService {
  constructor(private readonly ports: EntryActionPorts) {}

  create(input: unknown): Promise<EntryActionResult> {
    return this.run(createEntrySchema, input, async (userId, entry) => {
      const registered = await this.ports.registerEntry.execute(userId, entry);
      return registered.alerts;
    });
  }

  update(input: unknown): Promise<EntryActionResult> {
    return this.run(updateEntrySchema, input, async (userId, { kind, id, changes }) => {
      await this.ports.updateEntry.execute(userId, { kind, id }, changes);
      return [];
    });
  }

  remove(input: unknown): Promise<EntryActionResult> {
    return this.run(deleteEntrySchema, input, async (userId, { kind, id }) => {
      await this.ports.deleteEntry.execute(userId, { kind, id });
      return [];
    });
  }

  private async run<Input>(
    schema: ZodType<Input>,
    input: unknown,
    perform: (userId: string, parsed: Input) => Promise<SpendingAlert[]>
  ): Promise<EntryActionResult> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
    try {
      const userId = await this.ports.resolveUserId();
      return { ok: true, alerts: await perform(userId, parsed.data) };
    } catch (error) {
      return { ok: false, error: describeEntryActionFailure(error, this.ports.reportUnexpectedError) };
    }
  }
}
