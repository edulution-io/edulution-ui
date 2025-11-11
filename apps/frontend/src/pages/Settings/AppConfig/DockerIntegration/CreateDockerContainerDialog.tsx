/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import ProgressTextArea from '@/components/shared/ProgressTextArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useSseStore from '@/store/useSseStore';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TApps from '@libs/appconfig/types/appsType';
import convertComposeToDockerode from '@libs/docker/utils/convertComposeToDockerode';
import extractEnvPlaceholders from '@libs/docker/utils/extractEnvPlaceholders';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import updateContainerConfig from '@libs/docker/utils/updateContainerConfig';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
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
  const { isLoading, tableContentData, dockerContainerConfig, createAndRunContainer, fetchTableContent } =
    useDockerApplicationStore();
  const { eventSource } = useSseStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const isOpen = isDialogOpen === tableId;

  useEffect(() => {
    if (!eventSource) return undefined;
    const dockerProgressHandler = (e: MessageEvent<string>) => {
      const { progress, from } = JSON.parse(e.data) as DockerEvent;
      if (!progress) return;
      setDockerProgress((prevDockerProgress) => [...prevDockerProgress, `${from}: ${t(progress) ?? ''}`]);
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.CONTAINER_PROGRESS, dockerProgressHandler);

    return () => {
      eventSource.removeEventListener(SSE_MESSAGE_TYPE.CONTAINER_PROGRESS, dockerProgressHandler);
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

  const handleClose = () => setDialogOpen('');

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
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={() => {}}
          cancelButtonText={tableContentData.length === 0 ? 'common.cancel' : 'common.close'}
          submitButtonText="common.install"
          submitButtonType="submit"
          disableCancel={tableContentData.length !== 0 && isLoading}
          disableSubmit={tableContentData.length !== 0 || isLoading}
        />
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
        handleOpenChange={handleClose}
      />
    </>
  );
};

export default CreateDockerContainerDialog;
