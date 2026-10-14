export type UserRunSummary = { users: number; failed: number };

export async function runForUsers(
  label: string,
  userIds: string[],
  task: (userId: string) => Promise<void>
): Promise<UserRunSummary> {
  let failed = 0;
  for (const userId of userIds) {
    try {
      await task(userId);
    } catch (error) {
      failed++;
      console.error(`${label} failed for user ${userId}:`, error);
    }
  }
  return { users: userIds.length, failed };
}
