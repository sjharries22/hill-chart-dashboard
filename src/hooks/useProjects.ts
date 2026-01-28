'use client';

import useSWR from 'swr';
import { Project } from '@/lib/types';

interface ProjectsResponse {
  projects: Project[];
  lastUpdated: string;
  isMockData: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<ProjectsResponse>(
    '/api/clickup',
    fetcher,
    {
      refreshInterval: 43200000, // Refresh every 12 hours
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // Dedupe for 1 hour
    }
  );

  return {
    projects: data?.projects ?? [],
    lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : null,
    isMockData: data?.isMockData ?? false,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
