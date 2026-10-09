import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteTelegramMessageUseCase } from '@/modules/open-finance/application/use-cases/route-telegram-message';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import { FakeGoalPromptRepository } from './fake-goal-prompt-repository';

vi.mock('@/modules/notifications/telegram/TelegramService', () => ({
  TelegramService: {
    sendMessage: vi.fn(),
    sendTyping: vi.fn(),
  },
}));

import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { ExtractEntryWithAiUseCase } from '@/modules/finance/application/use-cases/extract-entry-with-ai';
import { AdvisorChatService } from '@/modules/ai/application/services/advisor-chat-service';
import { AskFinancialGoalsUseCase } from '@/modules/open-finance/application/use-cases/ask-financial-goals';
import { RecordGoalsReplyUseCase } from '@/modules/open-finance/application/use-cases/record-goals-reply';

describe('RouteTelegramMessageUseCase', () => {
  let goalPromptRepo: FakeGoalPromptRepository;
  let askFinancialGoals: { execute: ReturnType<typeof vi.fn> };
  let recordGoalsReply: { execute: ReturnType<typeof vi.fn> };
  let handleBotCommand: { execute: ReturnType<typeof vi.fn> };
  let registerManualEntry: { execute: ReturnType<typeof vi.fn> };
  let extractWithAi: { execute: ReturnType<typeof vi.fn> };
  let advisorChat: { respond: ReturnType<typeof vi.fn> };
  let useCase: RouteTelegramMessageUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    goalPromptRepo = new FakeGoalPromptRepository();
    askFinancialGoals = { execute: vi.fn() };
    recordGoalsReply = { execute: vi.fn() };
    handleBotCommand = { execute: vi.fn().mockResolvedValue('Ajuda aqui') };
    registerManualEntry = { execute: vi.fn().mockResolvedValue({ type: 'expense', category: 'Mercado', description: 'Arroz', amount: 25.9, alerts: [] }) };
    extractWithAi = { execute: vi.fn().mockResolvedValue({ success: false, needsClarification: false }) };
    advisorChat = { respond: vi.fn().mockResolvedValue('Conselho financeiro') };

    useCase = new RouteTelegramMessageUseCase({
      handleBotCommand: handleBotCommand as unknown as HandleBotCommandUseCase,
      registerManualEntry: registerManualEntry as unknown as RegisterManualEntryUseCase,
      extractWithAi: extractWithAi as unknown as ExtractEntryWithAiUseCase,
      advisorChat: advisorChat as unknown as AdvisorChatService,
      askFinancialGoals: askFinancialGoals as unknown as AskFinancialGoalsUseCase,
      recordGoalsReply: recordGoalsReply as unknown as RecordGoalsReplyUseCase,
      goalPromptRepo,
    });
  });

  it('routes bare /goal to askFinancialGoals', async () => {
    await useCase.execute({ messageId: 1, text: '/goal' }, 'user-1');
    expect(askFinancialGoals.execute).toHaveBeenCalledWith('user-1');
  });

  it('routes /ajuda command to handleBotCommand and sends reply', async () => {
    await useCase.execute({ messageId: 2, text: '/ajuda' }, 'user-1');
    expect(handleBotCommand.execute).toHaveBeenCalledWith('user-1', '/ajuda');
    expect(TelegramService.sendMessage).toHaveBeenCalledWith('Ajuda aqui', 2);
  });

  it('routes deterministic pipe entry to registerManualEntry', async () => {
    await useCase.execute({ messageId: 3, text: 'saída | mercado | arroz | 25,90' }, 'user-1');
    expect(registerManualEntry.execute).toHaveBeenCalledWith('user-1', {
      type: 'expense',
      category: 'mercado',
      description: 'arroz',
      amount: 25.9,
    });
    expect(TelegramService.sendMessage).toHaveBeenCalled();
  });

  it('routes to AI extraction fallback when pipe format is missing', async () => {
    extractWithAi.execute.mockResolvedValueOnce({
      success: true,
      entry: { type: 'expense', category: 'Almoço', description: 'Restaurante', amount: 45 },
    });
    await useCase.execute({ messageId: 4, text: 'almocei por 45 reais' }, 'user-1');
    expect(registerManualEntry.execute).toHaveBeenCalledWith('user-1', {
      type: 'expense',
      category: 'Almoço',
      description: 'Restaurante',
      amount: 45,
    });
  });

  it('routes to advisor chat when message is a general question', async () => {
    await useCase.execute({ messageId: 5, text: 'como está minha meta este mês?' }, 'user-1');
    expect(advisorChat.respond).toHaveBeenCalledWith('user-1', 'como está minha meta este mês?');
    expect(TelegramService.sendMessage).toHaveBeenCalledWith('Conselho financeiro', 5);
  });
});
