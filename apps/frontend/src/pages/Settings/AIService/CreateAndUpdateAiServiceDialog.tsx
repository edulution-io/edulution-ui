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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';
import CreateAndUpdateAiServiceBody from '@/pages/Settings/AIService/components/CreateAndUpdateAiServiceBody';
import CreateAndUpdateAiServiceFooter from '@/pages/Settings/AIService/components/CreateAndUpdateAiServiceFooter';
import DeleteAiServiceDialog from '@/pages/Settings/AIService/components/DeleteAiServiceDialog';
import CreateAiServiceDto from '@libs/aiService/types/createAiServiceDto';
import getCreateAiServiceSchema from '@libs/aiService/constants/getCreateAiServiceSchema';
import AI_PROVIDERS from '@libs/aiService/constants/aiProviders';
import AI_SERVICE_PURPOSES from '@libs/aiService/constants/aiServicePurposes';

const CreateAndUpdateAiServiceDialog = () => {
  const {
    selectedAiService,
    setSelectedAiService,
    updateAiService,
    addNewAiService,
    isDialogOpen,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
  } = useAiServiceTableStore();

  const { t } = useTranslation();

  const initialFormValues: CreateAiServiceDto = selectedAiService || {
    name: '',
    provider: AI_PROVIDERS.OLLAMA,
    baseUrl: '',
    apiKey: '',
    model: '',
    purpose: AI_SERVICE_PURPOSES.CHAT,
    isActive: true,
  };

  const form = useForm<CreateAiServiceDto>({
    mode: 'onChange',
    resolver: zodResolver(getCreateAiServiceSchema(t)),
    defaultValues: initialFormValues,
  });

  const { reset } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedAiService, reset]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedAiService(null);
    reset();
  };

  const onSubmit = async (data: CreateAiServiceDto) => {
    if (selectedAiService) {
      await updateAiService(selectedAiService.id, data);
    } else {
      await addNewAiService(data);
    }
    closeDialog();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getFooter = () => (
    <CreateAndUpdateAiServiceFooter
      handleFormSubmit={handleFormSubmit}
      isSaveButtonDisabled={!form.formState.isValid}
      handleDelete={
        selectedAiService
          ? () => {
              setIsDialogOpen(false);
              setIsDeleteDialogOpen(true);
            }
          : undefined
      }
      handleClose={closeDialog}
    />
  );

  const getDialogBody = () => (
    <CreateAndUpdateAiServiceBody
      handleFormSubmit={handleFormSubmit}
      form={form}
      initialFormValues={initialFormValues}
    />
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isDialogOpen}
        handleOpenChange={() => closeDialog()}
        title={selectedAiService ? t('settings.aiServices.editAiService') : t('settings.aiServices.createAiService')}
        body={getDialogBody()}
        footer={getFooter()}
      />
      <DeleteAiServiceDialog />
    </>
  );
};

export default CreateAndUpdateAiServiceDialog;
