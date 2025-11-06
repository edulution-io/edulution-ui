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
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import VEYON_PROXY_TABLE_COLUMNS from '@libs/classManagement/constants/veyonProxyTableColumns';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useVeyonConfigTableStore from './useVeyonConfigTableStore';
import useAppConfigsStore from '../useAppConfigsStore';

interface AddVeyonProxyDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddVeyonProxyDialog: React.FC<AddVeyonProxyDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { appConfigs, patchSingleFieldInConfig } = useAppConfigsStore();
  const { selectedConfig, setSelectedConfig } = useVeyonConfigTableStore();
  const isOpen = isDialogOpen === tableId;

  const veyonProxyConfig = getExtendedOptionsValue(
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

  const { reset, getValues, formState } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedConfig, reset]);

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedConfig(null);
    reset();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { subnet, proxyAdress } = getValues();

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
        value: newConfig.length !== 0 ? { [ExtendedOptionKeys.VEYON_PROXYS]: newConfig } : {},
      });

      closeDialog();
    }
  };

  const getFooter = () => (
    <form
      onSubmit={handleFormSubmit}
      className="flex gap-4"
    >
      {selectedConfig && (
        <div className="mt-4">
          <Button
            variant="btn-attention"
            size="lg"
            onClick={handleDeleteVeyonProxyConfig}
          >
            {t('bulletinboard.delete')}
          </Button>
        </div>
      )}
      <DialogFooterButtons
        handleClose={closeDialog}
        handleSubmit={() => {}}
        disableSubmit={!formState.isValid}
        submitButtonText="common.save"
        submitButtonType="submit"
      />
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
      <form className="space-y-4">
        {renderFormFields([VEYON_PROXY_TABLE_COLUMNS.SUBNET, VEYON_PROXY_TABLE_COLUMNS.PROXY_ADDRESS])}
      </form>
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
    />
  );
};

export default AddVeyonProxyDialog;
