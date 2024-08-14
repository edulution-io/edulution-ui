import React, { useEffect, useState } from 'react';
import { MailIcon } from '@/assets/icons';
import { DropdownMenu } from '@/components';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { useForm } from 'react-hook-form';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import MailImporterTable from './MailImporterTable';

const UserSettingsMailsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    isLoading,
    externalMailProviderConfig,
    getExternalMailProviderConfig,
    getSyncJob,
    selectedSyncJob,
    deleteSyncJobs,
  } = useMailsStore();
  const [option, setOption] = useState('');
  const form = useForm();

  useEffect(() => {
    void getExternalMailProviderConfig();
    void getSyncJob();
  }, []);

  useEffect(() => {
    if (externalMailProviderConfig.length > 0) {
      setOption(externalMailProviderConfig[0].name);
    }
  }, [externalMailProviderConfig]);

  const renderFormField = (fieldName: string, label: string, type?: string) => (
    <FormFieldSH
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

  const handleDeleteSyncJob = () => {
    if (Object.keys(selectedSyncJob).length > 0) {
      const syncJobsToDelete = Object.keys(selectedSyncJob);
      void deleteSyncJobs(syncJobsToDelete);
    }
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [DeleteButton(() => handleDeleteSyncJob()), SaveButton(() => {})],
    keyPrefix: 'usersettings-mails-_',
  };

  return (
    <div className="bottom-8 left-4 right-0 top-3 h-screen md:left-64 md:right-[--sidebar-width]">
      <NativeAppHeader
        title={t('mail.sidebar')}
        description={null}
        iconSrc={MailIcon}
      />
      <h3>{t('mail.importer.title')}</h3>
      <div className="space-y-4 p-4">
        <DropdownMenu
          options={externalMailProviderConfig}
          selectedVal={isLoading ? t('common.loading') : t(option)}
          handleChange={setOption}
          classname="md:w-1/3"
        />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => console.info(data))}
            className="md:max-w-[75%]"
          >
            {renderFormField('username', t('common.username'))}
            {renderFormField('password', t('common.password'), 'password')}
          </form>
        </Form>
      </div>
      <h3 className="pt-5">{t('mail.importer.syncJobsTable')}</h3>
      <MailImporterTable />
      <FloatingButtonsBar config={config} />
    </div>
  );
};

export default UserSettingsMailsPage;
