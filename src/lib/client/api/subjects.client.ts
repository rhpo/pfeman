import type { Database } from '$lib/types/database';

type Subject = Database['public']['Tables']['pfe_subjects']['Row'];

interface FetchOptions {
  status?: string;
  specialty?: string;
  level?: string;
}

export async function fetchSubjects(options?: FetchOptions): Promise<Subject[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.specialty) params.set('specialty', options.specialty);
  if (options?.level) params.set('level', options.level);

  const res = await fetch(`/api/subjects?${params}`);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function fetchSubjectById(id: string): Promise<Subject> {
  const res = await fetch(`/api/subjects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch subject');
  return res.json();
}

export async function createSubject(data: Record<string, unknown>): Promise<Subject> {
  const res = await fetch('/api/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create subject');
  return res.json();
}
