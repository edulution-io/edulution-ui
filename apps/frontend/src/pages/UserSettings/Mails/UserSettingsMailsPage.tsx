/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MailIcon } from '@/assets/icons';
import { DropdownSelect } from '@/components';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { Form } from '@/components/ui/Form';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import syncjobDefaultConfig from '@libs/mail/constants/sync-job-default-config';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import StateLoader from '@/pages/FileSharing/utilities/StateLoader';
import replaceDiacritics from '@libs/common/utils/replaceDiacritics';
import FormField from '@/components/shared/FormField';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APPS from '@libs/appconfig/constants/apps';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import PageLayout from '@/components/structure/layout/PageLayout';
import MailImporterTable from './MailImporterTable';

const UserSettingsMailsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
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
  const { appConfigs } = useAppConfigsStore();
  const isMailConfigured = findAppConfigByName(appConfigs, APPS.MAIL);

  useEffect(() => {
    if (isMailConfigured) {
      void getExternalMailProviderConfig();
    }
  }, []);

  useEffect(() => {
    if (isMailConfigured && externalMailProviderConfig.length > 0) {
      setOption(externalMailProviderConfig[0].id);
      void getSyncJob();
    }
  }, [externalMailProviderConfig.length]);

  const handleDeleteSyncJob = () => {
    if (Object.keys(selectedSyncJob).length > 0) {
      const syncJobsToDelete = Object.keys(selectedSyncJob);
      void deleteSyncJobs(syncJobsToDelete);
      setSelectedSyncJob({});
    }
  };

  const handleCreateSyncJob = () => {
    const selectedProviderConfig = externalMailProviderConfig.filter((config) => config.id === option)[0];

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
      SaveButton(handleCreateSyncJob, externalMailProviderConfig.length > 0),
      ReloadButton(() => {
        void getSyncJob();
        void getExternalMailProviderConfig();
      }),
      DeleteButton(handleDeleteSyncJob, Object.keys(selectedSyncJob).length > 0),
    ],
    keyPrefix: 'usersettings-mails-_',
  };

  const renderFormField = (fieldName: string, label: string, type?: string) => (
    <FormField
      form={form}
      name={fieldName}
      labelTranslationId={label}
      type={type}
      defaultValue=""
      className="mb-4 mt-2 "
    />
  );

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('mail.sidebar'),
        iconSrc: MailIcon,
      }}
    >
      <StateLoader isLoading={isEditSyncJobLoading} />
      {isMailConfigured ? (
        <>
          <h3 className="text-background">{t('mail.importer.title')}</h3>
          <div className="space-y-4">
            <DropdownSelect
              options={externalMailProviderConfig}
              selectedVal={t(option)}
              handleChange={setOption}
              classname="md:w-1/3"
              placeholder={t('common.loading')}
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

            <div className="px-4">
              <h3 className="pt-5 text-background">{t('mail.importer.syncJobsTable')}</h3>
              <MailImporterTable />
            </div>
          </div>
          <FloatingButtonsBar config={config} />
        </>
      ) : (
        <p>{t('mail.importer.noMailConfigured')}</p>
      )}
    </PageLayout>
  );
};

export default UserSettingsMailsPage;
