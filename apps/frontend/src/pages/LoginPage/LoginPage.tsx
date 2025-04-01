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
import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import useUserStore from '@/store/UserStore/UserStore';
import UserDto from '@libs/user/types/user.dto';
import processLdapGroups from '@libs/user/utils/processLdapGroups';
import OtpInput from '@/components/shared/OtpInput';
import PageTitle from '@/components/PageTitle';
import getLoginFormSchema from './getLoginFormSchema';

type LocationState = {
  from: string;
};

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { eduApiToken, totpIsLoading, createOrUpdateUser, setEduApiToken, getTotpStatus } = useUserStore();

  const { isLoading } = auth;
  const [loginComplete, setLoginComplete] = useState(false);
  const [isEnterTotpVisible, setIsEnterTotpVisible] = useState(false);
  const [totp, setTotp] = useState('');
  const [webdavKey, setWebdavKey] = useState('');
  const [encryptKey, setEncryptKey] = useState('');

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(getLoginFormSchema(t)),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (auth.error) {
      if (auth.error.message.includes('Invalid response Content-Type:')) {
        form.setError('password', { message: t('auth.errors.EdulutionConnectionFailed') });
        return;
      }
      form.setError('password', { message: t(auth.error.message) });
    }
  }, [auth.error]);

  const onSubmit = async () => {
    try {
      const username = form.getValues('username');
      const password = form.getValues('password');
      const passwordHash = btoa(`${password}${isEnterTotpVisible ? `:${totp}` : ''}`);
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

      setLoginComplete(true);
      setIsEnterTotpVisible(false);
    };

    void registerUser();
  }, [auth.isAuthenticated, eduApiToken]);

  useEffect(() => {
    if (loginComplete) {
      const { from } = (location?.state ?? { from: '/' }) as LocationState;
      const toLocation = from === '/login' ? '/' : from;
      navigate(toLocation, {
        replace: true,
      });
    }
  }, [loginComplete]);

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
    setTotp('');
    setIsEnterTotpVisible(false);
  };

  const renderFormField = (fieldName: 'username' | 'password', label: string, type?: string, shouldTrim?: boolean) => (
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
              data-testid={`test-id-login-page-${fieldName}-input`}
            />
          </FormControl>
          <FormMessage className="text-foreground" />
        </FormItem>
      )}
    />
  );

  return (
    <>
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
        <Form
          {...form}
          data-testid="test-id-login-page-form"
        >
          <form
            onSubmit={form.handleSubmit(isEnterTotpVisible ? onSubmit : handleCheckMfaStatus)}
            className="space-y-4"
            data-testid="test-id-login-page-form"
          >
            {isEnterTotpVisible ? (
              <>
                <div className="mt-3 text-center font-bold">{t('login.enterMultiFactorCode')}</div>
                <OtpInput
                  totp={totp}
                  setTotp={setTotp}
                  onComplete={form.handleSubmit(onSubmit)}
                />
                {form.getFieldState('password').error?.message && (
                  <p>
                    <span>{t(form.getFieldState('password').error?.message || '')}</span>
                  </p>
                )}
              </>
            ) : (
              <>
                {renderFormField('username', t('common.username'), 'text', true)}
                {renderFormField('password', t('common.password'), 'password')}
              </>
            )}
            {!form.getFieldState('password').error && <p className="flex h-2" />}
            {isEnterTotpVisible ? (
              <Button
                className="mx-auto w-full justify-center text-foreground shadow-xl hover:bg-ciGrey/10"
                type="button"
                variant="btn-outline"
                size="lg"
                disabled={isLoading || totpIsLoading}
                onClick={onTotpCancelButtonClick}
              >
                {t('common.cancel')}
              </Button>
            ) : null}
            <Button
              className="mx-auto w-full justify-center text-background shadow-xl"
              type="submit"
              variant="btn-security"
              size="lg"
              data-testid="test-id-login-page-submit-button"
              disabled={isLoading || totpIsLoading}
            >
              {totpIsLoading || isLoading ? t('common.loading') : t('common.login')}
            </Button>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default LoginPage;
