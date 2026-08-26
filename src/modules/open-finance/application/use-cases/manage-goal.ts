import { GoalRepository, NewGoal } from '../../domain/repositories/goal-repository';

export class UpsertGoalUseCase {
  constructor(private repo: GoalRepository) {}
  async execute(data: NewGoal) {
    return this.repo.upsert(data);
  }
}
