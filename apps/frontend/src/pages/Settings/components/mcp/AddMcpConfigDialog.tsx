import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import McpConfigFormFields from '@/pages/Settings/components/mcp/McpConfigFormFields';
import useMcpConfigTableStore from '@/pages/Settings/components/mcp/hook/useMcpConfigTableStore';
import McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import useMcpConnectionTest from './hook/useMcpConnectionTest';

const mcpConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL'),
  allowedUsers: z.array(z.any()).optional(),
  allowedGroups: z.array(z.any()).optional(),
});

const defaultValues: McpConfigDto = {
  id: '',
  name: '',
  url: '',
  allowedUsers: [],
  allowedGroups: [],
};

const getConfigId = (config: McpConfigDto | null): string => {
  if (!config) return '';
  return config.id ?? '';
};

interface AddMcpConfigDialogProps {
  dialogKey: string;
}

const AddMcpConfigDialog: React.FC<AddMcpConfigDialogProps> = ({ dialogKey }) => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { setSelectedRows, addOrUpdateConfig, deleteTableEntry, selectedConfig, setSelectedConfig } =
    useMcpConfigTableStore();

  const isOpen = isDialogOpen === dialogKey;

  const selectedConfigId = useMemo(() => getConfigId(selectedConfig), [selectedConfig]);
  const isEditMode = selectedConfigId.length > 0;

  const form = useForm<McpConfigDto>({
    resolver: zodResolver(mcpConfigSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { control, watch, setValue, getValues, formState, reset } = form;
  const { isTesting, testResult, resetTest } = useMcpConnectionTest({ watch });

  useEffect(() => {
    if (isOpen) {
      if (selectedConfig && selectedConfigId) {
        reset({
          id: selectedConfigId,
          name: selectedConfig.name,
          url: selectedConfig.url,
          allowedUsers: selectedConfig.allowedUsers ?? [],
          allowedGroups: selectedConfig.allowedGroups ?? [],
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [isOpen, selectedConfigId, selectedConfig, reset]);

  const canSave = formState.isValid && testResult?.success;

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedConfig(null);
    setSelectedRows({});
    reset(defaultValues);
    resetTest();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const formValues = getValues();
    const configToSave: McpConfigDto = {
      id: formValues.id || selectedConfigId,
      name: formValues.name,
      url: formValues.url,
      allowedUsers: formValues.allowedUsers ?? [],
      allowedGroups: formValues.allowedGroups ?? [],
    };

    void addOrUpdateConfig(configToSave);
    closeDialog();
  };

  const handleDeleteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedConfigId) {
      void deleteTableEntry('', selectedConfigId);
    }
    closeDialog();
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={closeDialog}
      title={isEditMode ? t('mcpconfig.settings.editConfig') : t('mcpconfig.settings.createConfig')}
      body={
        <Form {...form}>
          <form
            className="space-y-4"
            autoComplete="off"
          >
            <McpConfigFormFields
              control={control}
              watch={watch}
              setValue={setValue}
              isTesting={isTesting}
              testResult={testResult}
            />
          </form>
        </Form>
      }
      footer={
        <form
          onSubmit={handleFormSubmit}
          className="flex w-full items-center justify-end gap-4"
        >
          {isEditMode && (
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

export default AddMcpConfigDialog;
