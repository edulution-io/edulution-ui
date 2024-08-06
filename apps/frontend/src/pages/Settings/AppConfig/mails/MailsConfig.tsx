import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { AppConfigOption } from '@libs/appconfig/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MailsConfigProps = {
  item: AppConfigOption;
};

const MailsConfig: React.FC<MailsConfigProps> = ({ item }) => {
  const form = useForm();
  const { t } = useTranslation();

  return (
    <Form {...form}>
      <FormFieldSH
        key={item.id}
        control={form.control}
        name={item.id}
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <h4>{t(`form`)}</h4>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <p>{t(`form.Description`)}</p>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
    </Form>
  );
};

export default MailsConfig;
