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
  const { setSelectedRows, addOrUpdateConfig, deleteTableEntry, selectedConfig, setSelectedConfig } =
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
    void addOrUpdateConfig({ ...getValues(), id: selectedConfig?.id || '' });
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
            />
          </form>
        </Form>
      }
      footer={
        <form
          onSubmit={handleFormSubmit}
          className="flex gap-4"
        >
          {selectedConfig && (
            <div className="mt-4">
              <Button
                variant="btn-attention"
                size="lg"
                onClick={handleDeleteConfig}
              >
                {t('common.delete')}
              </Button>
            </div>
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
