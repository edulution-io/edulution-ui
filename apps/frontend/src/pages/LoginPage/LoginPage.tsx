import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import useUserStore from '@/store/UserStore/UserStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import UserDto from '@libs/user/types/user.dto';
import processLdapGroups from '@libs/user/utils/processLdapGroups';

type LocationState = {
  from: string;
};

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { eduApiToken, webdavKey, createOrUpdateUser, setWebdavKey, setEduApiToken } = useUserStore();

  const { isLoading } = auth;
  const { setLmnApiToken } = useLmnApiStore();
  const [loginComplete, setLoginComplete] = useState(false);

  const formSchema: z.Schema = z.object({
    username: z.string({ required_error: t('username.required') }).max(32, { message: t('username.too_long') }),
    password: z.string({ required_error: t('password.required') }).max(32, { message: t('password.too_long') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (auth.error) {
      // NIEDUUI-322 Translate keycloak error messages
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
        setEduApiToken(requestUser.access_token);
        setWebdavKey(password);
      }
    } catch (e) {
      //
    }
  };

  const handleRegisterUser = async () => {
    const profile = auth.user?.profile;
    if (!profile) {
      return;
    }

    const newUser: UserDto = {
      username: profile.preferred_username!,
      email: profile.email!,
      ldapGroups: processLdapGroups(profile.ldapGroups as string[]),
      password: webdavKey,
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
      await setLmnApiToken(form.getValues('username') as string, form.getValues('password') as string);
      setLoginComplete(true);
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
          {renderFormField('username', t('common.username'))}
          {renderFormField('password', t('common.password'), 'password')}
          <div className="flex justify-between">
            {/* TODO: Add valid Password reset page -> NIEDUUI-53 */}
            {/* <div className="my-4 block font-bold text-gray-500">
              <input
                type="checkbox"
                className="mr-2 leading-loose"
              />
              <span className="mr-4 text-p">{t('login.remember_me')}</span>
            </div>
            <div className="my-4 block font-bold text-gray-500">
              <Link
                to="/"
                className="cursor-pointer border-b-2 border-gray-200 tracking-tighter text-black hover:border-gray-400"
              >
                <p>{t('login.forgot_password')}</p>
              </Link>
            </div> */}
          </div>
          <Button
            className="mx-auto w-full justify-center pt-4 text-background shadow-xl"
            type="submit"
            variant="btn-security"
            size="lg"
            data-testid="test-id-login-page-submit-button"
          >
            {isLoading ? t('common.loading') : t('common.login')}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default LoginPage;
