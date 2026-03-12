import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([/\w .-]*)*\/?$/i,
      'Invalid domain format',
    ),
  sitemapUrl: z.string().url('Invalid sitemap URL').optional().or(z.literal('')),
});

export const createScanSchema = z.object({
  url: z.string().url('Invalid URL'),
  type: z.enum(['FREE', 'FULL', 'VERIFY']).default('FREE'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  domain: z.string().optional(),
  sitemapUrl: z.string().url().optional().nullable(),
  settings: z.record(z.unknown()).optional(),
});

export function normalizeDomain(domain: string): string {
  let normalized = domain.trim().toLowerCase();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  try {
    const url = new URL(normalized);
    return url.origin;
  } catch {
    return normalized;
  }
}

export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  try {
    const parsed = new URL(normalized);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return normalized;
  }
}
