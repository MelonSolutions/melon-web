import { fetchWithAuth, ApiError } from './kyc';
import {
  JobIssue,
  JobIssueCounts,
  JobIssueList,
  JobIssueStats,
  JobIssueStatus,
} from '@/types/job-issues';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melon.ng';

export { ApiError };

export async function getJobIssues(params: {
  status?: JobIssueStatus;
  page?: number;
  limit?: number;
  organizationId?: string;
} = {}): Promise<JobIssueList> {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.page !== undefined && params.page !== null) query.append('page', String(params.page));
  if (params.limit !== undefined && params.limit !== null) query.append('limit', String(params.limit));
  if (params.organizationId) query.append('organizationId', params.organizationId);

  const queryString = query.toString();
  const url = `${API_BASE_URL}/kyc/issues${queryString ? `?${queryString}` : ''}`;
  return fetchWithAuth(url);
}

export async function getIssueCounts(): Promise<JobIssueCounts> {
  const url = `${API_BASE_URL}/kyc/issues/unread-count`;
  return fetchWithAuth(url);
}

// Counts per status, read from the list endpoint's `total` (limit=1 keeps each call small)
export async function getIssueStats(organizationId?: string): Promise<JobIssueStats> {
  const totalFor = (status?: JobIssueStatus) =>
    getJobIssues({ status, limit: 1, organizationId }).then((res) => res.total);

  const [open, resolved, closedUnresolved, all] = await Promise.all([
    totalFor('OPEN'),
    totalFor('RESOLVED'),
    totalFor('CLOSED_UNRESOLVED'),
    totalFor(),
  ]);

  return { open, resolved, closedUnresolved, all };
}

export async function getIssuesForJob(kycId: string): Promise<JobIssue[]> {
  const url = `${API_BASE_URL}/kyc/${kycId}/issues`;
  return fetchWithAuth(url);
}

export async function replyToIssue(issueId: string, text: string): Promise<JobIssue> {
  const url = `${API_BASE_URL}/kyc/issues/${issueId}/messages`;
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function markIssueRead(issueId: string): Promise<{ ok: boolean }> {
  const url = `${API_BASE_URL}/kyc/issues/${issueId}/read`;
  return fetchWithAuth(url, {
    method: 'PATCH',
  });
}

export async function resolveIssue(issueId: string, note?: string): Promise<JobIssue> {
  const url = `${API_BASE_URL}/kyc/issues/${issueId}/resolve`;
  const body = note !== undefined && note !== null && note.trim().length > 0 ? { note } : {};
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
