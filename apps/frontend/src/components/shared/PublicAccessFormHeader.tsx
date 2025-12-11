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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import { Button } from '@/components/shared/Button';
import useUserStore from '@/store/UserStore/useUserStore';

const PublicAccessFormHeader = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserStore();

  if (user?.username) {
    return null;
  }

  return (
    <div>
      <Button
        className="mx-auto mt-5 w-[200px] justify-center text-background shadow-xl"
        type="submit"
        variant="btn-security"
        size="lg"
        data-testid="test-id-login-page-submit-button"
        onClick={() =>
          navigate(LOGIN_ROUTE, {
            state: { from: location.pathname },
          })
        }
      >
        {t('common.toLogin')}
      </Button>
      <div className="mb-6 mt-6 flex items-center">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-4">{t('common.orContinueWithoutAccount')}</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>
    </div>
  );
};

export default PublicAccessFormHeader;
