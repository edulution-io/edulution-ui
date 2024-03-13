import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchRepoData } from '@/services';
import { QUERY_KEY } from '@/constants';

const useRepoData = (options?: Omit<UseQueryOptions, 'queryKey'>) =>
  useQuery({
    queryKey: [QUERY_KEY.repoData],
    queryFn: fetchRepoData,
    ...options,
  });

export default useRepoData;
