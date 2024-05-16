/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';

const handleApiError = (
  error: any,
  set: (params: any) => void,
  custom?: {
    errorName: string;
    isLoadingName: string;
  },
) => {
  console.error(error);

  let errorName = 'error';
  let isLoadingName = 'isLoading';
  if (custom) {
    errorName = custom.errorName;
    isLoadingName = custom.isLoadingName;
  }

  if (axios.isAxiosError(error)) {
    set({ [errorName]: error, [isLoadingName]: false });
  } else {
    set({ [error]: new Error('An unexpected error occurred'), [isLoadingName]: false });
  }
};

export default handleApiError;
