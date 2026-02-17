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
import useAiAssistantTableStore from '@/pages/Settings/AppConfig/chat/useAiAssistantTableStore';
import { useTranslation } from 'react-i18next';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import CreateAndUpdateAiAssistantFooter from '@/pages/Settings/AppConfig/chat/components/CreateAndUpdateAiAssistantFooter';
import { useForm } from 'react-hook-form';
import CreateAiAssistantDto from '@libs/aiAssistant/types/createAiAssistantDto';
import { zodResolver } from '@hookform/resolvers/zod';
import getCreateAiAssistantSchema from '@libs/aiAssistant/constants/getCreateAiAssistantSchema';
import CreateAndUpdateAiAssistantBody from '@/pages/Settings/AppConfig/chat/components/CreateAndUpdateAiAssistantBody';
import DeleteAiAssistantDialog from '@/pages/Settings/AppConfig/chat/components/DeleteAiAssistantDialog';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';

interface CreateAndUpdateAiAssistantDialogProps {
  tableId: ExtendedOptionKeysType;
}

const CreateAndUpdateAiAssistantDialog: React.FC<CreateAndUpdateAiAssistantDialogProps> = ({ tableId }) => {
  const {
    selectedAssistant,
    setSelectedAssistant,
    updateAssistant,
    addNewAssistant,
    nameExistsAlready,
    isNameCheckingLoading,
    setIsDeleteDialogOpen,
  } = useAiAssistantTableStore();

  const { t } = useTranslation();

  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const isOpen = isDialogOpen === tableId;

  const initialFormValues: CreateAiAssistantDto = selectedAssistant || {
    name: '',
    aiServiceId: '',
    systemPrompt: '',
    accessUsers: [],
    accessGroups: [],
    isActive: true,
  };

  const form = useForm<CreateAiAssistantDto>({
    mode: 'onChange',
    resolver: zodResolver(getCreateAiAssistantSchema(t)),
    defaultValues: initialFormValues,
  });

  const { reset, watch, getValues } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedAssistant, reset]);

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedAssistant(null);
    reset();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAssistant) {
      const { name, aiServiceId, systemPrompt, accessUsers, accessGroups, isActive } = getValues();
      await updateAssistant(selectedAssistant.id || '', {
        name: name?.trim() !== '' ? name : selectedAssistant.name,
        aiServiceId,
        systemPrompt,
        accessUsers,
        accessGroups,
        isActive,
      });
    } else {
      await addNewAssistant(getValues());
    }
    closeDialog();
  };

  const isCurrentNameEqualToSelected = () =>
    watch('name').trim() === (selectedAssistant?.name || '').trim() && watch('name').trim() !== '';

  const isNameValidationFailed = () => isNameCheckingLoading || (!isCurrentNameEqualToSelected() && nameExistsAlready);

  const isSaveButtonDisabled = () => isNameValidationFailed() || !form.formState.isValid;

  const getFooter = () => (
    <CreateAndUpdateAiAssistantFooter
      handleFormSubmit={(e: React.FormEvent) => handleFormSubmit(e)}
      isCurrentNameEqualToSelected={isCurrentNameEqualToSelected}
      isSaveButtonDisabled={isSaveButtonDisabled}
      handleDeleteAssistant={() => {
        setDialogOpen('');
        setIsDeleteDialogOpen(true);
      }}
      handleClose={closeDialog}
    />
  );

  const getDialogBody = () => (
    <CreateAndUpdateAiAssistantBody
      handleFormSubmit={(e: React.FormEvent) => handleFormSubmit(e)}
      form={form}
      isCurrentNameEqualToSelected={isCurrentNameEqualToSelected}
    />
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={() => {
          closeDialog();
        }}
        title={selectedAssistant ? t('chat.assistant.editAssistant') : t('chat.assistant.createNewAssistant')}
        body={getDialogBody()}
        footer={getFooter()}
        desktopContentClassName="overflow-visible"
        mobileContentClassName="overflow-visible"
      />
      <DeleteAiAssistantDialog />
    </>
  );
};

export default CreateAndUpdateAiAssistantDialog;
