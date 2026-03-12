export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SignupDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CreateProjectDto {
  name: string;
  domain: string;
  sitemapUrl?: string;
}

export interface UpdateProjectDto {
  name?: string;
  domain?: string;
  sitemapUrl?: string;
  settings?: Record<string, unknown>;
}

export interface ProjectDto {
  id: string;
  name: string;
  domain: string;
  sitemapUrl: string | null;
  detectedStack: string | null;
  settings: Record<string, unknown>;
  createdAt: string;
  latestScore?: number | null;
  latestComplianceLabel?: string | null;
}

export interface CreateScanDto {
  url: string;
  type?: 'FREE' | 'FULL' | 'VERIFY';
}
