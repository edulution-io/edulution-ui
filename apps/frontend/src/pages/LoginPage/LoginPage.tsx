import React, { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useEncryption } from '@/hooks/mutations';

import cleanAllStores from '@/store/utilis/cleanAllStores';
import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import useUserStore from '@/store/userStore';
import useLmnUserStore from '@/store/lmnApiStore';
import { OriginalIdTokenClaims } from '@/pages/SchoolmanagementPage/utilis/types';
import useUserQuery from '@/api/useUserQuery';
import OtpInput from './OtpInput';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const {
    setIsAuthenticated,
    setUser,
    setToken,
    token,
    setUserInfo,
    postCheckTotp,
    getUserInfoFromDb,
    setIsLoggedInInEduApi,
    setWebdavKey,
  } = useUserStore();
  const { setLmnApiToken } = useLmnUserStore();
  const [isEnterTotpVisible, setIsEnterTotpVisible] = useState(false);
  const [totp, setTotp] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const { loginUser } = useUserQuery();

  const { isLoading } = auth;

  const formSchema: z.Schema = isEnterTotpVisible
    ? z.object({}).optional()
    : z.object({
        username: z
          .string({ required_error: t('login.username.required') })
          .max(32, { message: t('login.username.too_long') }),
        password: z
          .string({ required_error: t('login.password.required') })
          .max(32, { message: t('login.password.too_long') }),
      });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (auth.error) {
      form.setError('password', { type: 'custom', message: auth.error.message });
    }
  }, [auth.error]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async () => {
    try {
      const username = (form.getValues('username') as string).trim();
      const password = form.getValues('password') as string;

      const requestUser = await auth.signinResourceOwnerCredentials({
        username,
        password,
      });

      if (requestUser) {
        const encryptedPassword = useEncryption({
          mode: 'encrypt',
          data: password,
          key: `${import.meta.env.VITE_WEBDAV_KEY}`,
        });

        await setLmnApiToken(username, password);

        setUser(username);
        setWebdavKey(encryptedPassword);
        setToken(requestUser.access_token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = () => {
    const password = form.getValues('password') as string;
    const encryptedPassword = useEncryption({
      mode: 'encrypt',
      data: password,
      key: `${import.meta.env.VITE_WEBDAV_KEY}`,
    });

    const profile = auth?.user?.profile as unknown as OriginalIdTokenClaims;
    const newProfile = { ...profile, password: encryptedPassword };
    loginUser(newProfile)
      .then(() => {
        setIsLoggedInInEduApi(true);
        setIsAuthenticated(true);
        setUserInfo(profile);
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    const login = async () => {
      if (!token || !auth.isAuthenticated || !auth.user?.profile?.preferred_username) {
        return;
      }
      const userInfo = await getUserInfoFromDb(auth.user.profile.preferred_username);
      const { mfaEnabled } = userInfo as { mfaEnabled: boolean };

      if (mfaEnabled) {
        setIsEnterTotpVisible(true);
      } else {
        handleLogin();
      }
    };

    login().catch((e) => console.error(e));
  }, [auth.isAuthenticated, token]);

  const handleCheckTotp = async (otp: string) => {
    setTotp(otp);
    try {
      await postCheckTotp(otp);
      handleLogin();
    } catch (e) {
      setError(e instanceof Error ? e : null);
    }
  };

  const renderFormField = (fieldName: string, label: string, type?: string) => (
    <FormFieldSH
      control={form.control}
      name={fieldName}
      defaultValue=""
      render={({ field }) => (
        <FormItem>
          <p className="font-bold">{label}</p>
          <FormControl>
            <Input
              {...field}
              type={type}
              disabled={isLoading}
              placeholder={label}
              variant="login"
              data-testid={`test-id-login-page-${fieldName}-input`}
            />
          </FormControl>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );

  return (
    <Card variant="modal">
      <img
        src={DesktopLogo}
        alt="edulution"
        className="mx-auto w-[250px]"
      />
      <Form
        {...form}
        data-testid="test-id-login-page-form"
      >
        <form
          onSubmit={form.handleSubmit(onSubmit) as VoidFunction}
          className="space-y-4"
          data-testid="test-id-login-page-form"
        >
          {isEnterTotpVisible ? (
            <>
              <div className="flex justify-between">
                <OtpInput
                  length={6}
                  onComplete={(otp) => handleCheckTotp(otp)}
                />
              </div>
              {error ? <p className="text-red-600">{t('login.totp.invalid')}</p> : <p>{t('login.totp.description')}</p>}
            </>
          ) : (
            <>
              {renderFormField('username', t('common.username'))}
              {renderFormField('password', t('common.password'), 'password')}
            </>
          )}

          <div className="flex justify-between">
            {/* TODO: Add valid Password reset page -> NIEDUUI-53 */}
            {/* <div className="my-4 block font-bold text-gray-500">
              <Link
                to="/"
                className="cursor-pointer border-b-2 border-gray-200 tracking-tighter text-black hover:border-gray-400"
              >
                <p>{t('login.forgot_password')}</p>
              </Link>
            </div> */}
          </div>
          {isEnterTotpVisible ? (
            <div className="flex justify-around">
              <Button
                className="w-1/4 justify-center pt-4 text-white shadow-xl"
                type="button"
                variant="btn-security"
                size="lg"
                onClick={() => {
                  setError(null);
                  setIsEnterTotpVisible(false);
                  cleanAllStores();
                }}
              >
                {t('login.totp.back')}
              </Button>
              <Button
                className="w-1/4 justify-center pt-4 text-white shadow-xl"
                type="button"
                variant="btn-security"
                size="lg"
                data-testid="test-id-login-page-submit-button"
                onClick={() => handleCheckTotp(totp)}
              >
                {isLoading ? t('common.loading') : t('common.login')}
              </Button>
            </div>
          ) : (
            <Button
              className="mx-auto w-full justify-center pt-4 text-white shadow-xl"
              type="submit"
              variant="btn-security"
              size="lg"
              data-testid="test-id-login-page-submit-button"
            >
              {isLoading ? t('common.loading') : t('common.login')}
            </Button>
          )}
        </form>
      </Form>
    </Card>
  );
};

export default LoginPage;
