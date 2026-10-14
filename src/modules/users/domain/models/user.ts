export type DataMode = 'manual' | 'pluggy';

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  dataMode: DataMode | null;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  dataMode?: DataMode | null;
  onboardingCompletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};
