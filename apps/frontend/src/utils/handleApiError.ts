/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import CustomAxiosError from '@libs/error/CustomAxiosError';
import { SHOW_TOASTER_DURATION } from '@libs/ui/constants/showToasterDuration';

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

    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return;
    }

    let errorMessage = i18n.t(axiosError.response?.data?.message) || axiosError.response?.statusText;

    if (error.response?.status === 413) {
      errorMessage = i18n.t('errors.requestTooLarge');
    }

    if (!displayedErrors.has(errorMessage)) {
      displayedErrors.add(errorMessage);
      toast.error(errorMessage || i18n.t('errors.unexpectedError'));

      setTimeout(() => {
        displayedErrors.delete(errorMessage);
      }, SHOW_TOASTER_DURATION);
    }

    set({ [errorName]: errorMessage });
  } else {
    console.error((error as Error).message);
    set({ [errorName]: i18n.t('errors.unexpectedError') });
  }
};

export default handleApiError;
