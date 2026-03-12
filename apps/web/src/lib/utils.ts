import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeverityColor(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'SERIOUS':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MODERATE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'MINOR':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function getComplianceColor(label: string) {
  if (label === 'Likely compliant') return 'bg-green-100 text-green-800';
  if (label === 'At risk') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}
