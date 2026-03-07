import type {
  User,
  ClientProfile,
  FreelancerProfile,
  Skill,
  PortfolioItem,
  Job,
  JobApplication,
  Conversation,
  Message,
  Contract,
  Payment,
  Review,
  Role,
  JobStatus,
  ApplicationStatus,
  ContractStatus,
  PaymentStatus,
} from "@prisma/client";

export type {
  User,
  ClientProfile,
  FreelancerProfile,
  Skill,
  PortfolioItem,
  Job,
  JobApplication,
  Conversation,
  Message,
  Contract,
  Payment,
  Review,
  Role,
  JobStatus,
  ApplicationStatus,
  ContractStatus,
  PaymentStatus,
};

export type SafeUser = Omit<User, "passwordHash">;

export type FreelancerProfileWithRelations = FreelancerProfile & {
  user: SafeUser;
  skills: Skill[];
  portfolioItems: PortfolioItem[];
};

export type ClientProfileWithRelations = ClientProfile & {
  user: SafeUser;
};

export type JobWithRelations = Job & {
  clientProfile: ClientProfileWithRelations;
  skills: Skill[];
  _count: {
    applications: number;
  };
};

export type ApplicationWithRelations = JobApplication & {
  job: JobWithRelations;
  freelancerProfile: FreelancerProfileWithRelations;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
