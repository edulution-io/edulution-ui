import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authenticate } from '@/services';

const useAuth = (options?: UseMutationOptions) =>
  useMutation({
    mutationFn: authenticate,
    ...options,
  });

export default useAuth;
