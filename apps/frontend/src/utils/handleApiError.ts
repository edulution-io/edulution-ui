/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import CustomAxiosError from '@libs/error/CustomAxiosError';

/*
 * Use this function to handle errors in your store functions that do requests to the API.
 *
 * By default it will try to set the variable `error` in your store,
 * if it differs you have to pass the variable name as string.
 */
const displayedErrors = new Set<string>();

const handleApiError = (error: any, set: (params: any) => void, errorName = 'error') => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as CustomAxiosError;

    const errorMessage = i18n.t(axiosError.response?.data?.message) || axiosError.response?.statusText;

    if (!displayedErrors.has(errorMessage)) {
      displayedErrors.add(errorMessage);
      toast.error(errorMessage || i18n.t('errors.unexpectedError'));

      setTimeout(() => {
        displayedErrors.delete(errorMessage);
      }, 5000);
    }

    set({ [errorName]: errorMessage });
  } else {
    console.error((error as Error).message);
    set({ [errorName]: i18n.t('errors.unexpectedError') });
  }
};

export default handleApiError;
