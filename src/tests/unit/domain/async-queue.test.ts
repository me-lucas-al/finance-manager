import { describe, it, expect } from 'vitest';
import { AsyncQueue } from '@/shared/infrastructure/async-queue';

const drain = async <T>(queue: AsyncQueue<T>): Promise<T[]> => {
  const items: T[] = [];
  for await (const item of queue) items.push(item);
  return items;
};

describe('AsyncQueue', () => {
  it('delivers items pushed before and after the consumer starts, then ends on close', async () => {
    const queue = new AsyncQueue<number>();
    queue.push(1);

    const consuming = drain(queue);
    queue.push(2);
    queue.close();

    expect(await consuming).toEqual([1, 2]);
  });

  it('keeps queued items readable after close and ignores later pushes', async () => {
    const queue = new AsyncQueue<string>();
    queue.push('a');
    queue.close();
    queue.push('b');

    expect(await drain(queue)).toEqual(['a']);
  });

  it('ends a waiting consumer when closed', async () => {
    const queue = new AsyncQueue<number>();
    const consuming = drain(queue);

    queue.close();

    expect(await consuming).toEqual([]);
  });
});
