import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import MailProxiesField from '@/pages/UserSettings/Details/MailProxiesField';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';

interface UserSettingsDetailsFormProps {
  userDataFields: { type: string; name: string; label: string; value: string | boolean | string[] | undefined }[];
}

const UserSettingsDetailsForm = (props: UserSettingsDetailsFormProps) => {
  const { userDataFields } = props;

  const { user, patchUserDetails } = useLmnApiStore();
  const { t } = useTranslation();

  const mailProxyField = { proxyAddresses: user?.proxyAddresses || [] };
  let dataFields: { [key: string]: string | string[] | boolean | undefined } = mailProxyField;
  userDataFields.forEach((field) => {
    dataFields = {
      ...dataFields,
      [field.name]: field.value,
    };
  });

  const form = useForm({
    defaultValues: dataFields,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => patchUserDetails(data))}>
        <div className="space-y-4 md:max-w-[80%]">
          <MailProxiesField
            formControl={form.control}
            value={form.getValues('proxyAddresses') as string[]}
            onChange={(mailProxies: string[]) => form.setValue('proxyAddresses', mailProxies)}
          />
          {userDataFields.map((field) => (
            <FormField
              form={form}
              key={field.name}
              type={field.type}
              name={field.name}
              labelTranslationId={field.label}
              defaultValue={field.value}
              variant="lightGray"
            />
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="btn-security"
            size="lg"
            type="submit"
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserSettingsDetailsForm;
