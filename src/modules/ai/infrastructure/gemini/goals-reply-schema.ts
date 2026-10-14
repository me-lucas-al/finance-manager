import { Type } from '@google/genai';

export function buildGoalsReplySchema(categories: string[]) {
  return {
    type: Type.OBJECT,
    properties: {
      monthlyGeneralTarget: { type: Type.NUMBER, nullable: true },
      monthlyCategoryTargets: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, format: 'enum', enum: categories },
            amount: { type: Type.NUMBER },
          },
          required: ['category', 'amount'],
        },
      },
      savingsGoalUpdates: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            targetAmount: { type: Type.NUMBER, nullable: true },
            targetDate: { type: Type.STRING, nullable: true },
            contributionAmount: { type: Type.NUMBER, nullable: true },
          },
          required: ['title', 'targetAmount', 'targetDate', 'contributionAmount'],
        },
      },
    },
    required: ['monthlyGeneralTarget', 'monthlyCategoryTargets', 'savingsGoalUpdates'],
  };
}
