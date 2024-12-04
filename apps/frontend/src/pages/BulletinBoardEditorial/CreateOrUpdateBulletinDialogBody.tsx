import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import BulletinDialogForm from '@libs/bulletinBoard/types/bulletinDialogForm';
import { DropdownMenu } from '@/components';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';

interface CreateOrUpdateBulletinDialogBodyProps {
  form: UseFormReturn<BulletinDialogForm>;
}

const CreateOrUpdateBulletinDialogBody = ({ form }: CreateOrUpdateBulletinDialogBodyProps) => {
  const { t } = useTranslation();
  const { categories, isLoading } = useAppConfigBulletinTable();

  const handleCategoryChange = (categoryName: string) =>
    form.setValue('category', categories.find((c) => c.name === categoryName) || categories[0]);

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div>{t('bulletinboard.category')}</div>
        <DropdownMenu
          options={categories}
          selectedVal={isLoading ? t('common.loading') : form.getValues('category')?.name}
          handleChange={handleCategoryChange}
          variant="light"
        />
        <FormField
          name="heading"
          form={form}
          labelTranslationId={t('bulletinboard.heading')}
          variant="default"
        />
        <FormField
          name="content"
          form={form}
          labelTranslationId={t('bulletinboard.content')}
          type="textarea"
          variant="default"
        />
      </form>
    </Form>
  );
};

export default CreateOrUpdateBulletinDialogBody;
