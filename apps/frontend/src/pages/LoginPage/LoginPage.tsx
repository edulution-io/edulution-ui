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

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useForm } from 'react-hook-form';
import CryptoJS from 'crypto-js';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { MdOutlineQrCode } from 'react-icons/md';
import { toast } from 'sonner';
import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import useUserStore from '@/store/UserStore/useUserStore';
import type UserDto from '@libs/user/types/user.dto';
import processLdapGroups from '@libs/user/utils/processLdapGroups';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import PageTitle from '@/components/PageTitle';
import SSE_EDU_API_ENDPOINTS from '@libs/sse/constants/sseEndpoints';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import delay from '@libs/common/utils/delay';
import type LoginQrSseDto from '@libs/auth/types/loginQrSse.dto';
import PageLayout from '@/components/structure/layout/PageLayout';
import APPS from '@libs/appconfig/constants/apps';
import LANDING_PAGE_ROUTE from '@libs/dashboard/constants/landingPageRoute';
import getLoginFormSchema from './getLoginFormSchema';
import TotpInput from './components/TotpInput';
import useAppConfigsStore from '../Settings/AppConfig/appConfigsStore';
import useAuthErrorHandler from './useAuthErrorHandler';

type LocationState = {
  from: string;
};

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };
  const { eduApiToken, totpIsLoading, isAuthenticated, createOrUpdateUser, setEduApiToken, getTotpStatus } =
    useUserStore();
  const { appConfigs } = useAppConfigsStore();

  const { isLoading } = auth;
  const [isEnterTotpVisible, setIsEnterTotpVisible] = useState(false);
  const [webdavKey, setWebdavKey] = useState('');
  const [encryptKey, setEncryptKey] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [sessionID, setSessionID] = useState<string | null>(null);

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(getLoginFormSchema(t)),
    defaultValues: {
      username: '',
      password: '',
      totpValue: '',
    },
  });

  useAuthErrorHandler(auth.error, form, showQrCode);

  const onSubmit = async () => {
    try {
      const username = form.getValues('username');
      const password = form.getValues('password');
      const totpValue = form.getValues('totpValue');

      const passwordHash = btoa(`${password}${isEnterTotpVisible || totpValue ? `:${totpValue}` : ''}`);
      const requestUser = await auth.signinResourceOwnerCredentials({
        username,
        password: passwordHash,
      });
      if (requestUser) {
        const newEncryptKey = CryptoJS.lib.WordArray.random(16).toString();
        setEncryptKey(newEncryptKey);
        setEduApiToken(requestUser.access_token);
        setWebdavKey(CryptoJS.AES.encrypt(password, newEncryptKey).toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      password: webdavKey,
      encryptKey,
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

      setIsEnterTotpVisible(false);
    };

    void registerUser();
  }, [auth.isAuthenticated, eduApiToken]);

  const isAppConfigReady = !appConfigs.find((appConfig) => appConfig.name === APPS.NONE);
  const isAuthenticatedAppReady = isAppConfigReady && isAuthenticated;

  useEffect(() => {
    if (!isAuthenticatedAppReady) return;

    if (state?.from) {
      navigate(state.from, { replace: true });
      return;
    }

    navigate(LANDING_PAGE_ROUTE, { replace: true });
  }, [isAuthenticatedAppReady, state?.from]);

  useEffect(() => {
    if (!showQrCode || !sessionID) {
      return undefined;
    }

    const eventSource = new EventSource(
      `${window.location.origin}/${EDU_API_ROOT}/${SSE_EDU_API_ENDPOINTS.SSE}/${AUTH_PATHS.AUTH_ENDPOINT}?sessionId=${sessionID}`,
    );

    const controller = new AbortController();
    const { signal } = controller;

    const handleLoginEvent = (e: MessageEvent<string>) => {
      try {
        const { username, password } = JSON.parse(atob(e.data)) as LoginQrSseDto;

        form.setValue('username', username);
        form.setValue('password', password);
      } catch (error) {
        console.error('JSON parse error:', error);
      }

      const handleEnterMfa = () => {
        setIsEnterTotpVisible(true);
        setShowQrCode(false);
      };

      void getTotpStatus(form.getValues('username')).then((isMfaEnabled) =>
        isMfaEnabled ? handleEnterMfa() : form.handleSubmit(onSubmit)(),
      );
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.MESSAGE, handleLoginEvent, { signal });

    const handleAbortConnection = () => {
      controller.abort();
      eventSource.close();
    };

    eventSource.onerror = async () => {
      handleAbortConnection();
      toast.error(t('auth.errors.EdulutionConnectionFailed'));
      await delay(5000);
      setShowQrCode(false);
    };

    const timeoutId = setTimeout(
      () => {
        handleAbortConnection();
        toast.info(t('login.infoQrCodeExpired'));
        setShowQrCode(false);
      },
      3 * 60 * 1000,
    );

    return () => {
      clearTimeout(timeoutId);
      handleAbortConnection();
    };
  }, [showQrCode, sessionID]);

  const handleCheckMfaStatus = async () => {
    const isMfaEnabled = await getTotpStatus(form.getValues('username'));
    if (!isMfaEnabled) {
      await form.handleSubmit(onSubmit)();
    } else {
      setIsEnterTotpVisible(true);
    }
  };

  const onTotpCancelButtonClick = () => {
    form.clearErrors();
    form.setValue('totpValue', '');
    setIsEnterTotpVisible(false);
  };

  const handleCancelOrToggleQrCode = () => {
    if (isEnterTotpVisible) {
      onTotpCancelButtonClick();
    } else {
      const newSessionID = uuidv4();
      setSessionID(newSessionID);
      setShowQrCode((prev) => !prev);
    }
  };

  useEffect(() => {
    form.setFocus('username');
  }, [form.setFocus]);

  const renderFormField = (fieldName: 'username' | 'password', label: string, type?: string, shouldTrim?: boolean) =>
    !isEnterTotpVisible && (
      <div>
        <FormFieldSH
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <p className="font-bold text-foreground">{label}</p>
              <FormControl>
                <Input
                  {...field}
                  type={type}
                  shouldTrim={shouldTrim}
                  disabled={isLoading}
                  placeholder={label}
                  variant="login"
                  width="full"
                  data-testid={`test-id-login-page-${fieldName}-input`}
                />
              </FormControl>
              <FormMessage className="text-foreground" />
            </FormItem>
          )}
        />
      </div>
    );

  const renderErrorMessage = () => {
    const passwordError = form.getFieldState('password').error?.message;
    return passwordError ? (
      <p className="h-5">
        <span>{t(passwordError)}</span>
      </p>
    ) : null;
  };

  const getMainContent = () => {
    if (showQrCode && !isEnterTotpVisible) {
      return (
        <>
          <QRCodeDisplay
            value={`${window.location.origin}/${EDU_API_ROOT}/${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_VIA_APP}?sessionId=${sessionID}`}
            size="lg"
          />
          <p className="font-bold">{t('login.loginWithQrDescription')}</p>
        </>
      );
    }

    return (
      <>
        {isEnterTotpVisible && (
          <FormFieldSH
            control={form.control}
            name="totpValue"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TotpInput
                    totp={field.value}
                    title={t('login.enterMultiFactorCode')}
                    setTotp={field.onChange}
                    onComplete={onSubmit}
                  />
                </FormControl>
                {renderErrorMessage()}
              </FormItem>
            )}
          />
        )}
        {renderFormField('username', t('common.username'), 'text', true)}
        {renderFormField('password', t('common.password'), 'password')}
      </>
    );
  };

  return (
    <PageLayout>
      <PageTitle translationId="login.pageTitle" />
      <Card
        variant="modal"
        className="overflow-y-auto bg-background scrollbar-thin"
      >
        <img
          src={DesktopLogo}
          alt="edulution"
          className="mx-auto w-64"
        />
        <Form
          {...form}
          data-testid="test-id-login-page-form"
        >
          <form
            onSubmit={form.handleSubmit(isEnterTotpVisible ? onSubmit : handleCheckMfaStatus)}
            className="space-y-4"
            data-testid="test-id-login-page-form"
          >
            {getMainContent()}
            {!showQrCode && !form.getFieldState('password').error && <p className="flex h-3" />}

            {!showQrCode && (
              <Button
                className="mx-auto w-full justify-center shadow-xl"
                type="submit"
                variant="btn-security"
                size="lg"
                data-testid="test-id-login-page-submit-button"
                disabled={isLoading || totpIsLoading}
              >
                {totpIsLoading || isLoading ? t('common.loading') : t('common.login')}
              </Button>
            )}
            <Button
              className="mx-auto w-full justify-center shadow-xl hover:bg-ciGrey/10"
              type="button"
              variant="btn-outline"
              size="lg"
              disabled={isLoading || totpIsLoading}
              onClick={handleCancelOrToggleQrCode}
            >
              {isEnterTotpVisible || showQrCode ? (
                t('common.cancel')
              ) : (
                <>
                  {t('login.loginWithApp')}
                  <MdOutlineQrCode size={20} />
                </>
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </PageLayout>
  );
};

export default LoginPage;
