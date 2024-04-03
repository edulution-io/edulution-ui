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
import { Link } from 'react-router-dom';
import { createWebdavClient } from '@/webdavclient/WebDavFileManager';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();

  const { isLoading } = auth;

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
    // TODO: Remove if webdav is stored in backend

    const encryptedPassword = useEncryption({
      mode: 'encrypt',
      data: form.getValues('password') as string,
      key: 'b0ijDqLs3YJYq5VvCNJv94vxvQzUTMHb',
    });

    sessionStorage.setItem('webdav', encryptedPassword);
    sessionStorage.setItem('user', form.getValues('username') as string);

    createWebdavClient();

    // --------------------------------------------------

    try {
      await auth.signinResourceOwnerCredentials({
        username: form.getValues('username') as string,
        password: form.getValues('password') as string,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card variant="modal">
      <img
        src={DesktopLogo}
        alt="edulution"
        className="mx-auto w-[250px]"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit) as VoidFunction}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="username"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <p className="font-bold">{t('common.username')}</p>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder={t('common.username')}
                    variant="login"
                  />
                </FormControl>
                <FormMessage className="text-p" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <p className="font-bold">{t('common.password')}</p>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    disabled={isLoading}
                    variant="login"
                  />
                </FormControl>
                <FormMessage className="text-p" />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <div className="my-4 block font-bold text-gray-500">
              <input
                type="checkbox"
                className="mr-2 leading-loose"
              />
              <span className="mr-4 text-p">{t('login.remember_me')}</span>
            </div>
            <div className="my-4 block font-bold text-gray-500">
              <Link
                to="/" // TODO: Add valid Password reset page
                className="cursor-pointer border-b-2 border-gray-200 tracking-tighter text-black hover:border-gray-400"
              >
                <p>{t('login.forgot_password')}</p>
              </Link>
            </div>
          </div>
          <Button
            className="mx-auto w-full justify-center pt-4 text-white shadow-xl"
            type="submit"
            variant="btn-security"
            size="lg"
          >
            {isLoading ? t('common.loading') : t('common.login')}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default LoginPage;
