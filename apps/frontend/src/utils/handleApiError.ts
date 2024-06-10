/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';

/*
 * Use this function to handle errors in your store functions that do requests to the API.
 *
 * By default it will try to set the variables `error` and `isLoading` in your store,
 * if they differ you have to pass the variable name as string.
 */
const handleApiError = (error: any, set: (params: any) => void, errorName = 'error', isLoadingName = 'isLoading') => {
  console.error(error);

  if (axios.isAxiosError(error)) {
    set({ [errorName]: error, [isLoadingName]: false });
  } else {
    set({ [errorName]: new Error('An unexpected error occurred'), [isLoadingName]: false });
  }
};

export default handleApiError;
