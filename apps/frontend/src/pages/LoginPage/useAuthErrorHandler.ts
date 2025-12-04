/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Path, UseFormReturn } from 'react-hook-form';
import { ErrorContext } from 'react-oidc-context';

const useAuthErrorHandler = <TFormValues extends Record<'password', unknown>>(
  authError: ErrorContext | undefined,
  form: UseFormReturn<TFormValues>,
  showQrCode: boolean,
) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!authError) return;

    if (authError.message.includes('Invalid response Content-Type:')) {
      form.setError('password' as Path<TFormValues>, { message: t('auth.errors.EdulutionConnectionFailed') });
      return;
    }

    if (authError.message.includes('Token is not active')) {
      form.setError('password' as Path<TFormValues>, { message: t('auth.errors.tokenIsNotActive') });
      return;
    }

    if (authError.source?.includes('renewSilent') || authError.message.includes('No silent_redirect_uri configured')) {
      form.setError('password' as Path<TFormValues>, { message: t('auth.errors.TokenExpired') });
      return;
    }

    form.setError('password' as Path<TFormValues>, { message: t(authError.message) });

    if (showQrCode) {
      toast.error(t(authError.message));
    }
  }, [authError, form]);

  useEffect(() => {
    form.clearErrors();
  }, [showQrCode]);
};

export default useAuthErrorHandler;
