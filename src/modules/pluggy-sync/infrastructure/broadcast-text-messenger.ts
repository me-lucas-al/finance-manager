export interface TextChannel {
  sendMessage(userId: string, text: string): Promise<unknown>;
}

export class BroadcastTextMessenger {
  constructor(private readonly channels: TextChannel[]) {}

  async sendMessage(userId: string, text: string): Promise<boolean> {
    const outcomes = await Promise.allSettled(this.channels.map((channel) => channel.sendMessage(userId, text)));
    outcomes.forEach((outcome) => {
      if (outcome.status === 'rejected') console.error(`Import announcement channel failed for user ${userId}:`, outcome.reason);
    });
    return outcomes.some((outcome) => outcome.status === 'fulfilled' && Boolean(outcome.value));
  }
}
