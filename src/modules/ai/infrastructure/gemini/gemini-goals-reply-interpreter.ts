import type {
  GoalsReplyInput,
  GoalsReplyInterpretation,
  GoalsReplyInterpreter,
} from '@/modules/open-finance/domain/ports/goals-reply-interpreter';
import { GEMINI_FLASH_MODEL, getGeminiClient } from './gemini-client';
import { buildGoalsReplyPrompt } from './goals-reply-prompt';
import { buildGoalsReplySchema } from './goals-reply-schema';

export class GeminiGoalsReplyInterpreter implements GoalsReplyInterpreter {
  async interpret(input: GoalsReplyInput): Promise<GoalsReplyInterpretation> {
    const response = await getGeminiClient().models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: buildGoalsReplyPrompt(input),
      config: {
        responseMimeType: 'application/json',
        responseSchema: buildGoalsReplySchema(input.categories),
      },
    });

    const parsed = JSON.parse(response.text ?? '{}') as Partial<GoalsReplyInterpretation>;
    return {
      monthlyGeneralTarget: parsed.monthlyGeneralTarget ?? null,
      monthlyCategoryTargets: (parsed.monthlyCategoryTargets ?? []).filter((target) =>
        input.categories.includes(target.category),
      ),
      savingsGoalUpdates: parsed.savingsGoalUpdates ?? [],
    };
  }
}
