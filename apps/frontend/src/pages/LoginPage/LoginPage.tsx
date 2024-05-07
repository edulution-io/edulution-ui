import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useEncryption } from '@/hooks/mutations';

import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { createWebdavClient } from '@/webdavclient/WebDavFileManager';
import useUserStore from '@/store/userStore';
import useLmnUserStore from '@/store/lmnApiStore';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { setUser, setWebdavKey, setIsAuthenticated } = useUserStore();

  const { isLoading } = auth;
  const { getToken } = useLmnUserStore((state) => ({
    getToken: state.getToken,
  }));

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
      form.setError('password', { type: 'custom', message: auth.error.message });
    }
  }, [auth.error]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async () => {
    try {
      const username = form.getValues('username') as string;
      const password = form.getValues('password') as string;
      const requestUser = await auth.signinResourceOwnerCredentials({
        username,
        password,
      });

      if (requestUser) {
        await getToken(username, password);
        const encryptedPassword = useEncryption({
          mode: 'encrypt',
          data: form.getValues('password') as string,
          key: `${import.meta.env.VITE_WEBDAV_KEY}`,
        });

        setUser(form.getValues('username') as string);
        setWebdavKey(encryptedPassword);
        setIsAuthenticated(true);

        createWebdavClient();
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  const renderFormField = (fieldName: string, label: string, type?: string) => (
    <FormField
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
            className="mx-auto w-full justify-center pt-4 text-white shadow-xl"
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
