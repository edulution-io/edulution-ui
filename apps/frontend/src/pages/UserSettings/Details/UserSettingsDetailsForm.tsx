import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import BooleanInputProp from '@libs/common/types/boolean-input-prop';
import SingleInputProp from '@libs/common/types/single-input-prop';
import MultiInputProp from '@libs/common/types/multi-input-prop';
import useLmnApiStore from '@/store/useLmnApiStore';
import BadgeFormField from '@/components/shared/BadgeFormField';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';

interface UserSettingsDetailsFormProps {
  userDataFields: Array<SingleInputProp | BooleanInputProp>;
  userDataMultiFields: MultiInputProp[];
}

const UserSettingsDetailsForm = (props: UserSettingsDetailsFormProps) => {
  const { userDataFields, userDataMultiFields } = props;

  const { user, patchUserDetails } = useLmnApiStore();
  const { t } = useTranslation();

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
          {userDataFields.map((field: SingleInputProp | BooleanInputProp) => (
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
          {userDataMultiFields.map((field: MultiInputProp) => (
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
