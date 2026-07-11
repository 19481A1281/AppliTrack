export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastActivity: string;
  requiresAction: boolean;
  schedulingLink?: string;
  logo: string;
  source: string;
  tags: string[];
}

export type AppMode = 'idle' | 'preview' | 'scanning' | 'live';

export interface ScanConfig {
  email: string;
  password: string;
  startDate: string;
  endDate: string;
}

export interface PipelineVelocityData {
  period: string;
  interviews: number;
  rejections: number;
  shortlisted: number;
}

export interface AppState {
  mode: AppMode;
  applications: JobApplication[];
  config: ScanConfig;
  isNewCard: string | null;
}
