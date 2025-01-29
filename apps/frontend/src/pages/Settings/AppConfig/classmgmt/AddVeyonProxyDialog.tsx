import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import FormField from '@/components/shared/FormField';
import createVeyonProxyConfigSchema from '@libs/classManagement/constants/createVeyonProxyConfigSchema';
import type VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import useVeyonConfigTableStore from './useVeyonTableStore';
import useAppConfigsStore from '../appConfigsStore';

interface AddVeyonProxyDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddVeyonProxyDialog: React.FC<AddVeyonProxyDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { appConfigs, patchSingleFieldInConfig } = useAppConfigsStore();
  const { selectedConfig, setSelectedConfig } = useVeyonConfigTableStore();
  const isOpen = isDialogOpen === tableId;

  const veyonProxyConfig = getExtendedOptionValue(
    appConfigs,
    APPS.CLASS_MANAGEMENT,
    ExtendedOptionKeys.VEYON_PROXYS,
  ) as VeyonProxyItem[];

  const initialFormValues = selectedConfig || {
    veyonProxyId: '',
    subnet: '',
    proxyAdress: '',
  };

  const form = useForm<VeyonProxyItem>({
    mode: 'onChange',
    resolver: zodResolver(createVeyonProxyConfigSchema(t)),
    defaultValues: initialFormValues,
  });

  const { reset } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedConfig, reset]);

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedConfig(null);
    reset();
  };

  const handleFormSubmit = async (data: VeyonProxyItem) => {
    const { subnet, proxyAdress } = data;

    let newConfig: VeyonProxyItem[];
    if (selectedConfig) {
      const filteredVeyonConfig = veyonProxyConfig.filter((item) => item.veyonProxyId !== selectedConfig.veyonProxyId);
      newConfig = [...filteredVeyonConfig, { veyonProxyId: selectedConfig.veyonProxyId, subnet, proxyAdress }];
    } else {
      newConfig = [...veyonProxyConfig, { veyonProxyId: uuidv4(), subnet, proxyAdress }];
    }

    await patchSingleFieldInConfig(APPS.CLASS_MANAGEMENT, {
      field: 'extendedOptions',
      value: { [ExtendedOptionKeys.VEYON_PROXYS]: newConfig },
    });

    closeDialog();
  };

  const handleDeleteVeyonProxyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedConfig) {
      const newConfig = veyonProxyConfig.filter((item) => item.veyonProxyId !== selectedConfig.veyonProxyId);

      await patchSingleFieldInConfig(APPS.CLASS_MANAGEMENT, {
        field: 'extendedOptions',
        value: newConfig.length === 0 ? { [ExtendedOptionKeys.VEYON_PROXYS]: newConfig } : {},
      });

      closeDialog();
    }
  };

  const getFooter = () => (
    <form
      onSubmit={form.handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          variant="btn-outline"
          size="lg"
          type="button"
          onClick={() => setDialogOpen('')}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="btn-collaboration"
          size="lg"
          type="submit"
        >
          {t('common.save')}
        </Button>
        {selectedConfig && (
          <Button
            variant="btn-attention"
            size="lg"
            onClick={handleDeleteVeyonProxyConfig}
          >
            {t('bulletinboard.delete')}
          </Button>
        )}
      </div>
    </form>
  );

  const renderFormFields = (fields: Array<keyof VeyonProxyItem>) =>
    fields.map((name) => (
      <FormField
        key={name}
        name={name}
        defaultValue={initialFormValues[name]}
        form={form}
        labelTranslationId={t(`classmanagement.veyonConfigTable.${name}`)}
        variant="dialog"
      />
    ));

  const getDialogBody = () => (
    <Form {...form}>
      <form className="space-y-4">{renderFormFields(['subnet', 'proxyAdress'])}</form>
    </Form>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={() => {
        setDialogOpen('');
        setSelectedConfig(null);
      }}
      title={
        selectedConfig
          ? t('classmanagement.veyonConfigTable.editConfig')
          : t('classmanagement.veyonConfigTable.createConfig')
      }
      body={getDialogBody()}
      footer={getFooter()}
      mobileContentClassName="bg-background h-fit h-max-1/2"
    />
  );
};

export default AddVeyonProxyDialog;
