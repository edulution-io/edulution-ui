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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CreateAiChatModelDto from '@libs/aiChatModel/types/createAiChatModelDto';
import getCreateAiChatModelSchema from '@libs/aiChatModel/constants/getCreateAiChatModelSchema';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import useAiChatModelTableStore from '@/pages/Settings/AppConfig/chat/useAiChatModelTableStore';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import CreateAndUpdateAiChatModelBody from '@/pages/Settings/AppConfig/chat/components/CreateAndUpdateAiChatModelBody';
import CreateAndUpdateAiChatModelFooter from '@/pages/Settings/AppConfig/chat/components/CreateAndUpdateAiChatModelFooter';
import DeleteAiChatModelDialog from '@/pages/Settings/AppConfig/chat/components/DeleteAiChatModelDialog';

interface CreateAndUpdateAiChatModelDialogProps {
  tableId: ExtendedOptionKeysType;
}

const CreateAndUpdateAiChatModelDialog: React.FC<CreateAndUpdateAiChatModelDialogProps> = ({ tableId }) => {
  const { selectedModel, setSelectedModel, updateModel, addNewModel, setIsDeleteDialogOpen } =
    useAiChatModelTableStore();

  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const isOpen = isDialogOpen === tableId;

  const initialFormValues = selectedModel || {
    name: '',
    aiServiceId: '',
    systemPrompt: '',
    accessGroups: [],
    isActive: true,
  };

  const form = useForm<CreateAiChatModelDto>({
    mode: 'onChange',
    resolver: zodResolver(getCreateAiChatModelSchema(t)),
    defaultValues: initialFormValues,
  });

  const { reset, getValues } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedModel, reset]);

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedModel(null);
    reset();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedModel) {
      await updateModel(selectedModel.id, getValues());
    } else {
      await addNewModel(getValues());
    }
    closeDialog();
  };

  const isSaveButtonDisabled = () => !form.formState.isValid;

  const getFooter = () => (
    <CreateAndUpdateAiChatModelFooter
      handleFormSubmit={(e: React.FormEvent) => handleFormSubmit(e)}
      isSaveButtonDisabled={isSaveButtonDisabled}
      handleDelete={
        selectedModel
          ? () => {
              setDialogOpen('');
              setIsDeleteDialogOpen(true);
            }
          : undefined
      }
      handleClose={closeDialog}
    />
  );

  const getDialogBody = () => (
    <CreateAndUpdateAiChatModelBody
      handleFormSubmit={(e: React.FormEvent) => handleFormSubmit(e)}
      form={form}
    />
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={() => closeDialog()}
        title={selectedModel ? t('chat.aiChatModel.edit') : t('chat.aiChatModel.createNew')}
        body={getDialogBody()}
        footer={getFooter()}
      />
      <DeleteAiChatModelDialog />
    </>
  );
};

export default CreateAndUpdateAiChatModelDialog;
