import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from 'usehooks-ts';

import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/shared/Card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/shared/Button';

export const SettingsForm: React.FC = () => {
  const { t } = useTranslation();

  type ConfigType = {
    conferencePath?: string;
  };

  const [config, setConfig] = useLocalStorage<ConfigType>('edu-config', {});

  const formSchema = z.object({
    conferencePath: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conferencePath: config.conferencePath || '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    setConfig(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="text-inherit"
      >
        <FormField
          control={form.control}
          name="conferencePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(`${field.name}`)}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('path')}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t(`${field.name}.description`)}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t('save')}</Button>
      </form>
    </Form>
  );
};

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="text-white">
        <h1 className="mb-1 text-lg">{t('settings')}</h1>
        <p className="text-md mt-4">Einstellungen für die Verlinkung der einzelnen Apps</p>
      </div>
      <Card>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </>
  );
};

export default SettingsPage;
