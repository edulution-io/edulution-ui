import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authenticate } from '@/services';

export const useAuth = (options?: UseMutationOptions) => {
  return useMutation({
    mutationFn: authenticate,
    ...options,
  });
};
