export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  onboardingCompletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};
