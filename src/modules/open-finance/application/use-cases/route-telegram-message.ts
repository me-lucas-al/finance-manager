import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import { parseEntryMessage } from '@/modules/finance/domain/parsers/parse-entry-message';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { ExtractEntryWithAiUseCase } from '@/modules/finance/application/use-cases/extract-entry-with-ai';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import { AdvisorChatService } from '@/modules/ai/application/services/advisor-chat-service';
import { formatEntryConfirmation } from '@/modules/finance/application/services/manual-entry-confirmation-formatter';
import type { AskFinancialGoalsUseCase } from './ask-financial-goals';
import type { RecordGoalsReplyUseCase } from './record-goals-reply';
import type { GoalPromptRepository } from '../../domain/repositories/goal-prompt-repository';

export type TelegramIncomingMessage = {
  messageId: number;
  text: string;
  replyToMessageId?: number;
};

export type RouteTelegramDeps = {
  handleBotCommand: HandleBotCommandUseCase;
  registerManualEntry: RegisterManualEntryUseCase;
  extractWithAi: ExtractEntryWithAiUseCase;
  advisorChat: AdvisorChatService;
  askFinancialGoals: AskFinancialGoalsUseCase;
  recordGoalsReply: RecordGoalsReplyUseCase;
  goalPromptRepo: GoalPromptRepository;
};

export class RouteTelegramMessageUseCase {
  constructor(private deps: RouteTelegramDeps) {}

  async execute(message: TelegramIncomingMessage, userId: string): Promise<void> {
    const trimmed = message.text.trim();

    if (message.replyToMessageId) {
      const prompt = await this.deps.goalPromptRepo.findByTelegramMessageId(message.replyToMessageId);
      if (prompt && !prompt.answeredAt) {
        await this.deps.recordGoalsReply.execute(userId, trimmed, prompt.id, message.messageId);
        return;
      }
    }

    if (trimmed.toLowerCase().startsWith('/goal')) {
      const remaining = trimmed.slice(5).trim();
      if (!remaining) {
        await this.deps.askFinancialGoals.execute(userId);
      } else {
        await this.deps.recordGoalsReply.execute(userId, remaining, undefined, message.messageId);
      }
      return;
    }

    if (trimmed.startsWith('/')) {
      const commandReply = await this.deps.handleBotCommand.execute(userId, trimmed);
      await TelegramService.sendMessage(commandReply, message.messageId);
      return;
    }

    const parsed = parseEntryMessage(trimmed);
    if (parsed) {
      const res = await this.deps.registerManualEntry.execute(userId, parsed);
      const conf = formatEntryConfirmation(res);
      await TelegramService.sendMessage(conf, message.messageId);
      return;
    }

    const aiExtraction = await this.deps.extractWithAi.execute(trimmed);
    if (aiExtraction.success) {
      const res = await this.deps.registerManualEntry.execute(userId, aiExtraction.entry);
      const conf = formatEntryConfirmation(res);
      await TelegramService.sendMessage(conf, message.messageId);
      return;
    }

    if (aiExtraction.needsClarification) {
      await TelegramService.sendMessage(aiExtraction.question, message.messageId);
      return;
    }

    await TelegramService.sendTyping();
    const reply = await this.deps.advisorChat.respond(userId, trimmed);
    await TelegramService.sendMessage(reply, message.messageId);
  }
}
