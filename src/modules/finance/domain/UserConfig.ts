import { DistributionRule } from './DistributionRule';

export class UserConfig {
  constructor(
    public readonly distributionRule: DistributionRule = new DistributionRule()
  ) {}
}
