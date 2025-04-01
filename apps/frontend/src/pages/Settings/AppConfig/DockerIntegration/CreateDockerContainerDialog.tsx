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
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import ProgressTextArea from '@/components/shared/ProgressTextArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TApps from '@libs/appconfig/types/appsType';
import convertComposeToDockerode from '@libs/docker/utils/convertComposeToDockerode';
import extractEnvPlaceholders from '@libs/docker/utils/extractEnvPlaceholders';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import updateContainerConfig from '@libs/docker/utils/updateContainerConfig';
import useDockerApplicationStore from './useDockerApplicationStore';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';
import getCreateContainerFormSchema from './getCreateContainerFormSchema';

interface CreateDockerContainerDialogProps {
  settingLocation: TApps;
  tableId: ExtendedOptionKeysType;
}

const CreateDockerContainerDialog: React.FC<CreateDockerContainerDialogProps> = ({ settingLocation, tableId }) => {
  const { t } = useTranslation();
  const [dockerProgress, setDockerProgress] = useState(['']);
  const [showInputForm, setShowInputForm] = useState(false);
  const [createContainerConfig, setCreateContainerConfig] = useState([{}]);
  const [combinedEnvPlaceholders, setCombinedEnvPlaceholders] = useState({});
  const { isLoading, eventSource, tableContentData, dockerContainerConfig, createAndRunContainer, fetchTableContent } =
    useDockerApplicationStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const isOpen = isDialogOpen === tableId;

  useEffect(() => {
    if (!eventSource) return undefined;
    const dockerProgressHandler = (e: MessageEvent<string>) => {
      const { progress, from } = JSON.parse(e.data) as DockerEvent;
      if (!progress) return;
      setDockerProgress((prevDockerProgress) => [...prevDockerProgress, `${from}: ${t(progress) ?? ''}`]);
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.MESSAGE, dockerProgressHandler);

    return () => {
      eventSource.removeEventListener(SSE_MESSAGE_TYPE.MESSAGE, dockerProgressHandler);
    };
  }, []);

  useEffect(() => {
    if (dockerContainerConfig) {
      const containerConfig = convertComposeToDockerode(dockerContainerConfig);
      const envPlaceholders = extractEnvPlaceholders(createContainerConfig);
      const showInput = Object.keys(envPlaceholders).length > 0;

      setCreateContainerConfig(containerConfig);
      setCombinedEnvPlaceholders(envPlaceholders);
      setShowInputForm(showInput);
    }
  }, [dockerContainerConfig]);

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(getCreateContainerFormSchema(t, showInputForm)),
  });

  useEffect(() => {
    form.reset();
  }, []);

  const handleCreateContainer = async () => {
    if (createContainerConfig) {
      const formValues = form.getValues();
      const updatedConfig = updateContainerConfig(createContainerConfig, formValues);
      await createAndRunContainer(updatedConfig);
      await fetchTableContent(settingLocation);
    }
  };

  const getDialogBody = () => (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          e.stopPropagation();
          await form.handleSubmit(handleCreateContainer)(e);
        }}
        className="flex flex-col gap-4"
      >
        {showInputForm
          ? Object.keys(combinedEnvPlaceholders).map((placeholder) => (
              <FormField
                key={placeholder}
                name={placeholder}
                form={form}
                labelTranslationId={t(`containerApplication.${placeholder}.title`)}
                variant="dialog"
                description={t(`containerApplication.${placeholder}.description`)}
              />
            ))
          : null}
        <ProgressTextArea text={dockerProgress} />
        <div className="flex justify-end gap-2">
          <Button
            variant="btn-outline"
            size="lg"
            type="button"
            className="w-24 border-2"
            onClick={() => setDialogOpen('')}
            disabled={tableContentData.length !== 0 && isLoading}
          >
            {tableContentData.length === 0 ? t('common.cancel') : t('common.close')}
          </Button>
          <Button
            variant="btn-collaboration"
            size="lg"
            type="submit"
            className="w-24"
            disabled={tableContentData.length !== 0 || isLoading}
          >
            {t('common.install')}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <>
      <div className="absolute right-10 top-12 md:right-24 md:top-1">{isLoading ? <CircleLoader /> : null}</div>
      <AdaptiveDialog
        title={t(`containerApplication.dialogTitle`, { applicationName: t(`${settingLocation}.sidebar`) })}
        isOpen={isOpen}
        body={getDialogBody()}
        handleOpenChange={() => setDialogOpen('')}
      />
    </>
  );
};

export default CreateDockerContainerDialog;
