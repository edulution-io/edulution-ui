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

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import PageTitle from '@/components/PageTitle';
import PageLayout from '@/components/structure/layout/PageLayout';
import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import useUserStore from '@/store/UserStore/UserStore';
import UserDto from '@libs/user/types/user.dto';
import processLdapGroups from '@libs/user/utils/processLdapGroups';
import APPS from '@libs/appconfig/constants/apps';
import useAppConfigsStore from '../Settings/AppConfig/appConfigsStore';

type LocationState = {
  from: string;
};

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { eduApiToken, setEduApiToken, createOrUpdateUser } = useUserStore();
  const { appConfigs } = useAppConfigsStore();

  const isAppConfigReady = appConfigs.some((appConfig) => appConfig.name !== APPS.NONE);
  const isAuthenticatedAppReady = isAppConfigReady && eduApiToken;

  useEffect(() => {
    if (isAuthenticatedAppReady) {
      const { from } = (location?.state ?? { from: '/' }) as LocationState;
      const toLocation = from === LOGIN_ROUTE ? '/' : from;
      navigate(toLocation, {
        replace: true,
      });
    }
  }, [isAuthenticatedAppReady]);

  const handleLogin = () => {
    void auth.signinRedirect();
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      setEduApiToken(auth.user?.access_token as string);
    }
  }, [auth.isAuthenticated]);

  const handleRegisterUser = async () => {
    const profile = auth.user?.profile;
    if (!profile) {
      return;
    }

    const newUser: UserDto = {
      username: profile.preferred_username!,
      firstName: profile.given_name!,
      lastName: profile.family_name!,
      email: profile.email!,
      ldapGroups: processLdapGroups(profile.ldapGroups as string[]),
      password: '',
      encryptKey: '',
    };
    await createOrUpdateUser(newUser);
  };

  useEffect(() => {
    const isLoginPrevented = !eduApiToken || !auth.isAuthenticated || !auth.user?.profile?.preferred_username;
    if (isLoginPrevented) {
      return;
    }
    const registerUser = async () => {
      await handleRegisterUser();
    };

    void registerUser();
  }, [auth.isAuthenticated, eduApiToken]);

  return (
    <PageLayout>
      <PageTitle translationId="login.pageTitle" />
      <Card
        variant="modal"
        className="bg-background"
      >
        <img
          src={DesktopLogo}
          alt="edulution"
          className="mx-auto w-64"
        />
        <div className="flex flex-col items-center space-y-4 p-6">
          <Button
            onClick={handleLogin}
            variant="btn-security"
            size="lg"
            disabled={auth.isLoading}
          >
            {auth.isLoading ? t('common.loading') : t('common.login')}
          </Button>
        </div>
      </Card>
    </PageLayout>
  );
};

export default LoginPage;
