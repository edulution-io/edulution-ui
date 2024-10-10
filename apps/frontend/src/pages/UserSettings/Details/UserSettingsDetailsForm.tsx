import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import BadgeFormField from '@/pages/UserSettings/Details/BadgeFormField';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';

interface UserSettingsDetailsFormProps {
  userDataFields: { type: string; name: string; label: string; value: string | boolean | string[] | undefined }[];
  userDataMultiFields: { type: string; name: string; label: string; value: string[] | undefined }[];
}

const UserSettingsDetailsForm = (props: UserSettingsDetailsFormProps) => {
  const { userDataFields, userDataMultiFields } = props;

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

  const proxyAddresses = form.watch('proxyAddresses') as string[];

  if (!user?.name) return null;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => patchUserDetails(user?.name, data))}>
        <div className="space-y-4 md:max-w-[75%]">
          <BadgeFormField
            formControl={form.control}
            value={proxyAddresses}
            onChange={(mailProxies: string[]) => form.setValue('proxyAddresses', mailProxies)}
            fieldName="proxyAddresses"
            placeholder={t('usersettings.details.newProxy')}
          />
          {userDataFields.map((field) => (
            <FormField
              key={field.name}
              form={form}
              type={field.type}
              name={field.name}
              labelTranslationId={field.label}
              defaultValue={field.value}
              variant="lightGray"
            />
          ))}
          {userDataMultiFields.map((field) => (
            <BadgeFormField
              key={field.name}
              formControl={form.control}
              value={field.value || []}
              onChange={(badges: string[]) => form.setValue(field.name, badges)}
              fieldName={field.name}
              placeholder={t('common.add')}
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
