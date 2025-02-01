import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputProp from '@libs/common/types/input-prop';
import { SOPHOMORIX_TEACHER } from '@libs/lmnApi/constants/sophomorixRoles';
import useLmnApiStore from '@/store/useLmnApiStore';
import BadgeFormField from '@/components/shared/BadgeFormField';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';

const UserSettingsDetailsForm = () => {
  const { user, patchUserDetails } = useLmnApiStore();

  const { t } = useTranslation();

  // TODO: NIEDUUI-417: Make this dynamic using the user object
  let userDataFields: Array<InputProp<string> | InputProp<number> | InputProp<boolean>> = [];
  if (user?.sophomorixRole === SOPHOMORIX_TEACHER) {
    userDataFields = [
      {
        type: 'text',
        name: 'sophomorixCustom1',
        label: t('usersettings.details.sophomorixCustom1_teacher'),
        value: user?.sophomorixCustom1 || '',
      },
      {
        type: 'text',
        name: 'sophomorixCustom2',
        label: t('usersettings.details.sophomorixCustom2_teacher'),
        value: user?.sophomorixCustom2 || '',
      },
    ];
  }

  // TODO: NIEDUUI-417: Make this dynamic using the user object
  let userDataMultiFields: Array<InputProp<string[]>> = [];
  if (user?.sophomorixRole === SOPHOMORIX_TEACHER) {
    userDataMultiFields = [
      {
        type: 'badges',
        name: 'sophomorixCustomMulti1',
        label: t('usersettings.details.sophomorixCustomMulti1_teacher'),
        value: user?.sophomorixCustomMulti1 || [],
      },
    ];
  }

  const form = useForm({
    defaultValues: {
      proxyAddresses: user?.proxyAddresses || [],
      ...userDataFields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {}),
      ...userDataMultiFields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {}),
    },
  });

  if (!user?.name) return null;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => patchUserDetails(data))}>
        <div className="space-y-4 md:max-w-[75%]">
          <BadgeFormField
            form={form}
            name="proxyAddresses"
            labelTranslationId="usersettings.details.proxyAddresses"
            placeholder={t('usersettings.details.addNew')}
          />
          {userDataFields.map((field: InputProp<string> | InputProp<number> | InputProp<boolean>) => (
            <FormField
              form={form}
              key={field.name}
              type={field.type}
              name={field.name}
              labelTranslationId={field.label}
              defaultValue={field.value}
            />
          ))}
          {userDataMultiFields.map((field: InputProp<string[]>) => (
            <BadgeFormField
              form={form}
              key={field.name}
              name={field.name || field.label}
              labelTranslationId={field.label}
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
