/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';

/*
 * Use this function to handle errors in your store functions that do requests to the API.
 *
 * By default it will try to set the variable `error` in your store,
 * if it differs you have to pass the variable name as string.
 */
const handleApiError = (error: any, set: (params: any) => void, errorName = 'error') => {
  console.error(error);

  if (axios.isAxiosError(error)) {
    set({ [errorName]: error });
  } else {
    set({ [errorName]: new Error('An unexpected error occurred') });
  }
};

export default handleApiError;
