import type { Database } from '$lib/types/database';

type Report = Database['public']['Tables']['pfe_progress_reports']['Row'];

export async function fetchReports(assignmentId: string): Promise<Report[]> {
  const res = await fetch(`/api/progress-reports?assignment_id=${assignmentId}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function createReport(data: Record<string, unknown>): Promise<Report> {
  const res = await fetch('/api/progress-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create report');
  return res.json();
}
