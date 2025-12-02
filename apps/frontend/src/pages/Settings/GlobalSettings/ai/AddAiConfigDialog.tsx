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

import React from 'react';
import { useTranslation } from 'react-i18next';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AiConfigFormFields from '@/pages/Settings/GlobalSettings/ai/components/AiConfigFormFields';
import useAiConfigTableStore from './useAiConfigTableStore';
import useAiConfigForm from './hooks/useAiConfigForm';
import useAiModelSelection from './hooks/useAiModelSelection';

interface AddAiConfigDialogProps {
  dialogKey: string;
}

const AddAiConfigDialog: React.FC<AddAiConfigDialogProps> = ({ dialogKey }) => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { setSelectedRows, addOrUpdateConfig, deleteTableEntry, selectedConfig, setSelectedConfig, tableContentData } =
    useAiConfigTableStore();

  const isOpen = isDialogOpen === dialogKey;

  const { form, resetForm } = useAiConfigForm(isOpen);
  const { control, watch, setValue, getValues, formState } = form;

  const { models, isLoadingModels, modelsError, isTesting, testResult, resetAll } = useAiModelSelection({
    watch,
    setValue,
  });

  const canSave = formState.isValid && testResult?.success;

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedConfig(null);
    setSelectedRows?.({});
    resetForm();
    resetAll();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const formValues = getValues();
    const configToSave = {
      ...formValues,
      id: selectedConfig?.id || '',
    };

    void addOrUpdateConfig(configToSave);
    closeDialog();
  };

  const handleDeleteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedConfig?.id && deleteTableEntry) {
      void deleteTableEntry('', selectedConfig.id);
    }
    closeDialog();
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={closeDialog}
      title={selectedConfig ? t('aiconfig.settings.editConfig') : t('aiconfig.settings.createConfig')}
      body={
        <Form {...form}>
          <form
            className="space-y-4"
            key={selectedConfig?.id || 'new'}
            autoComplete="off"
          >
            <AiConfigFormFields
              control={control}
              watch={watch}
              setValue={setValue}
              models={models}
              isLoadingModels={isLoadingModels}
              modelsError={modelsError}
              isTesting={isTesting}
              testResult={testResult}
              existingConfigs={tableContentData}
            />
          </form>
        </Form>
      }
      footer={
        <form
          onSubmit={handleFormSubmit}
          className="flex w-full items-center justify-end gap-4"
        >
          {selectedConfig && (
            <Button
              variant="btn-attention"
              size="lg"
              onClick={handleDeleteConfig}
            >
              {t('common.delete')}
            </Button>
          )}
          <DialogFooterButtons
            handleClose={closeDialog}
            handleSubmit={() => {}}
            disableSubmit={!canSave}
            submitButtonText="common.save"
            submitButtonType="submit"
          />
        </form>
      }
    />
  );
};

export default AddAiConfigDialog;
