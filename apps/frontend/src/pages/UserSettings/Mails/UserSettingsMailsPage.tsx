import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MailIcon } from '@/assets/icons';
import { DropdownMenu } from '@/components';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useUserStore from '@/store/UserStore/UserStore';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import syncjobDefaultConfig from '@libs/mail/constants/sync-job-default-config';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import StateLoader from '@/pages/FileSharing/utilities/StateLoader';
import replaceDiacritics from '@libs/common/utils/replaceDiacritics';
import MailImporterTable from './MailImporterTable';

const UserSettingsMailsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    isGetSyncJobLoading,
    isEditSyncJobLoading,
    externalMailProviderConfig,
    getExternalMailProviderConfig,
    selectedSyncJob,
    setSelectedSyncJob,
    getSyncJob,
    postSyncJob,
    deleteSyncJobs,
  } = useMailsStore();
  const { user } = useUserStore();
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

  const handleDeleteSyncJob = () => {
    if (Object.keys(selectedSyncJob).length > 0) {
      const syncJobsToDelete = Object.keys(selectedSyncJob);
      void deleteSyncJobs(syncJobsToDelete);
      setSelectedSyncJob({});
    }
  };

  const handleCreateSyncJob = () => {
    const selectedProviderConfig = externalMailProviderConfig.filter((config) => config.name === option)[0];

    const createSyncJobDto = {
      ...syncjobDefaultConfig,
      username: user?.email || '',
      host1: selectedProviderConfig.host,
      port1: selectedProviderConfig.port,
      user1: form.getValues('email') as string,
      password1: form.getValues('password') as string,
      enc1: selectedProviderConfig.encryption,
      subfolder2: replaceDiacritics(selectedProviderConfig.label),
    };

    void postSyncJob(createSyncJobDto);
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      SaveButton(() => handleCreateSyncJob(), externalMailProviderConfig.length > 0),
      ReloadButton(() => {
        void getSyncJob();
        void getExternalMailProviderConfig();
      }),
      DeleteButton(() => handleDeleteSyncJob(), Object.keys(selectedSyncJob).length > 0),
    ],
    keyPrefix: 'usersettings-mails-_',
  };

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
              placeholder={label}
              variant="lightGray"
              data-testid={`test-id-login-page-${fieldName}-input`}
            />
          </FormControl>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="bottom-8 left-4 right-0 top-3 h-screen md:left-64 md:right-[--sidebar-width]">
      <div className="flex flex-row justify-between">
        <NativeAppHeader
          title={t('mail.sidebar')}
          description={null}
          iconSrc={MailIcon}
        />
        <StateLoader isLoading={isEditSyncJobLoading} />
      </div>
      <h3>{t('mail.importer.title')}</h3>
      <div className="space-y-4 p-4 ">
        <DropdownMenu
          options={externalMailProviderConfig}
          selectedVal={isGetSyncJobLoading ? t('common.loading') : t(option)}
          handleChange={setOption}
          classname="md:w-1/3"
        />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateSyncJob)}
            className="md:max-w-[75%]"
          >
            {renderFormField('email', t('mail.importer.mailAddress'))}
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
