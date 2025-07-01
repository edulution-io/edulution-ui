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

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { ErrorContext } from 'react-oidc-context';

const useAuthErrorHandler = (
  authError: ErrorContext | undefined,
  form: UseFormReturn<FieldValues>,
  showQrCode: boolean,
) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!authError) return;

    if (authError.message.includes('Invalid response Content-Type:')) {
      form.setError('password', { message: t('auth.errors.EdulutionConnectionFailed') });
      return;
    }

    if (authError.message.includes('Token is not active')) {
      form.setError('password', { message: t('auth.errors.tokenIsNotActive') });
      return;
    }

    if (authError.source?.includes('renewSilent')) {
      form.setError('password', { message: t('auth.errors.TokenExpired') });
      return;
    }

    form.setError('password', { message: t(authError.message) });

    if (showQrCode) {
      toast.error(t(authError.message));
    }
  }, [authError, form, showQrCode]);
};

export default useAuthErrorHandler;
