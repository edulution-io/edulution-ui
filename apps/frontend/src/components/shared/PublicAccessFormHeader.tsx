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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import { Button } from '@/components/shared/Button';
import useUserStore from '@/store/UserStore/UserStore';

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
