export type Period = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewPeriod = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  closedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};
