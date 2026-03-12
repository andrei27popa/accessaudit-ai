'use client';

// Reuse the public issue detail page for dashboard context
// This redirects to the shared issue detail page
import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function DashboardIssueDetailPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const issueGroupId = params.issueGroupId as string;

  // Redirect to the shared issue detail page
  redirect(`/scan/${scanId}/issues/${issueGroupId}`);
}
