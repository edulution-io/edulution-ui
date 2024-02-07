import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchRepoData } from '@/services';
import { QUERY_KEY } from '@/constants';

export const useRepoData = (options?: Omit<UseQueryOptions, 'queryKey'>) => {
  return useQuery({
    queryKey: [QUERY_KEY.repoData],
    queryFn: fetchRepoData,
    ...options,
  });
};
