import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

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
    try {
      await auth.signinResourceOwnerCredentials({
        username: form.getValues('username') as string,
        password: form.getValues('password') as string,
      });
    } catch (e) {
      //
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
                    className="placeholder:color:ciLightGrey rounded placeholder:text-p"
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
                    className="placeholder:color:ciLightGrey rounded placeholder:text-p"
                  />
                </FormControl>
                <FormMessage className="text-p" />
              </FormItem>
            )}
          />
          <Button
            className="mx-auto pt-4 text-white"
            type="submit"
            variant="btn-collaboration"
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
