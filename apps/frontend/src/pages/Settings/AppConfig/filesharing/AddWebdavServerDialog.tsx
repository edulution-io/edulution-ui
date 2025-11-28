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
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Form, FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import FormField from '@/components/shared/FormField';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { RowSelectionState } from '@tanstack/react-table';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import { DropdownSelect } from '@/components';
import WEBDAV_SHARE_AUTHENTICATION_METHODS from '@libs/webdav/constants/webdavShareAuthenticationMethods';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';

interface AddWebdavServerDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddWebdavServerDialog: React.FC<AddWebdavServerDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { searchGroups } = useGroupStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const {
    selectedRows,
    tableContentData,
    setSelectedRows,
    deleteTableEntry,
    itemToDelete,
    setItemToDelete,
    fetchTableContent,
  } = useWebdavServerConfigTableStore();
  const { updateWebdavShare, createWebdavShare } = useWebdavShareConfigTableStore();
  const isOpen = isDialogOpen === tableId;
  const keys = Object.keys(selectedRows as RowSelectionState);
  const isOneRowSelected = keys.length === 1;
  const selectedConfig = selectedRows && isOneRowSelected ? tableContentData[Number(keys[0])] : null;

  const initialFormValues = selectedConfig || {
    [WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.URL]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.PATHNAME]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.IS_ROOT_SERVER]: true,
    [WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS]: [],
    [WEBDAV_SHARE_TABLE_COLUMNS.TYPE]: WEBDAV_SHARE_TYPE.LINUXMUSTER,
    [WEBDAV_SHARE_TABLE_COLUMNS.AUTHENTICATION]: WEBDAV_SHARE_AUTHENTICATION_METHODS.BASIC,
  };

  const form = useForm<WebdavShareDto>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        [WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME]: z
          .string()
          .min(1, { message: t('common.required') })
          .refine(
            (val) => {
              if (!selectedConfig) {
                return !tableContentData.some((s) => s.displayName.toLowerCase() === val.toLowerCase());
              }
              return true;
            },
            {
              message: t('settings.errors.webdavShareNameAlreadyExists'),
            },
          ),
        [WEBDAV_SHARE_TABLE_COLUMNS.URL]: z
          .string()
          .url({ message: t('settings.appconfig.sections.veyon.invalidUrlFormat') }),
      }),
    ),
    defaultValues: initialFormValues,
  });

  const { reset, getValues, setValue, control, formState } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedConfig, reset]);

  const closeDialog = () => {
    setDialogOpen('');
    if (setSelectedRows) {
      setSelectedRows({});
    }
    reset();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const webdavShareValues = getValues();
    const urlWithTrailingSlash = webdavShareValues.url.endsWith('/')
      ? webdavShareValues.url
      : `${webdavShareValues.url}/`;
    const webdavShareDto: WebdavShareDto = {
      ...webdavShareValues,
      url: urlWithTrailingSlash,
      pathname: new URL(urlWithTrailingSlash).pathname,
    };
    if (selectedConfig) {
      void updateWebdavShare(selectedConfig?.webdavShareId || '', webdavShareDto);
    } else {
      void createWebdavShare(webdavShareDto);
    }

    closeDialog();
  };

  const handleConfirmDelete = async () => {
    const configToDelete = itemToDelete || selectedConfig;
    if (configToDelete?.webdavShareId && deleteTableEntry) {
      await deleteTableEntry('', configToDelete.webdavShareId);
      if (setSelectedRows) {
        setSelectedRows({});
      }
      await fetchTableContent();
    }
    setItemToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteDialogClose = (open: boolean) => {
    if (!open) {
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const deleteItem = itemToDelete || selectedConfig;

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const uniqueGroups = newGroups.reduce<MultipleSelectorGroup[]>((acc, g) => {
      if (!acc.some((x) => x.value === g.value)) acc.push(g);
      return acc;
    }, []);
    setValue(WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS, uniqueGroups, { shouldValidate: true });
  };

  const webdavShareTypeOptions = Object.values(WEBDAV_SHARE_TYPE).map((id) => ({
    id,
    name: t(`webdavShare.type.${id}`),
  }));

  const webdavShareAuthenticationOptions = Object.values(WEBDAV_SHARE_AUTHENTICATION_METHODS).map((id) => ({
    id,
    name: t(`webdavShare.authentication.${id}`),
  }));

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
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
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

  const renderFormFields = () => (
    <>
      <FormField
        name={WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME}
        defaultValue={initialFormValues[WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME]}
        form={form}
        labelTranslationId={t('webdavShare.displayName')}
        variant="dialog"
      />
      <FormField
        name={WEBDAV_SHARE_TABLE_COLUMNS.URL}
        defaultValue={initialFormValues[WEBDAV_SHARE_TABLE_COLUMNS.URL]}
        form={form}
        labelTranslationId={t(`form.${WEBDAV_SHARE_TABLE_COLUMNS.URL}`)}
        variant="dialog"
      />
      <FormFieldSH
        control={control}
        name={WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS}
        render={() => (
          <FormItem>
            <p className="font-bold">{t('webdavShare.accessGroups.title')}</p>
            <FormControl>
              <AsyncMultiSelect<MultipleSelectorGroup>
                value={getValues(WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS)}
                onSearch={searchGroups}
                onChange={handleGroupsChange}
                placeholder={t('search.type-to-search')}
                variant="dialog"
              />
            </FormControl>
            <FormDescription>{t('webdavShare.accessGroups.description')}</FormDescription>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormFieldSH
        control={form.control}
        name={WEBDAV_SHARE_TABLE_COLUMNS.TYPE}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('webdavShare.type.title')}</p>
            <FormControl>
              <DropdownSelect
                options={webdavShareTypeOptions}
                selectedVal={field.value}
                handleChange={field.onChange}
                variant="dialog"
              />
            </FormControl>
            <FormDescription>{t('webdavShare.type.description')}</FormDescription>
          </FormItem>
        )}
      />
      <FormFieldSH
        control={form.control}
        name={WEBDAV_SHARE_TABLE_COLUMNS.AUTHENTICATION}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('webdavShare.authentication.title')}</p>
            <FormControl>
              <DropdownSelect
                options={webdavShareAuthenticationOptions}
                selectedVal={field.value}
                handleChange={field.onChange}
                variant="dialog"
              />
            </FormControl>
            <FormDescription>{t('webdavShare.authentication.description')}</FormDescription>
          </FormItem>
        )}
      />
    </>
  );

  const getDialogBody = () => (
    <Form {...form}>
      <form className="space-y-4">{renderFormFields()}</form>
    </Form>
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={closeDialog}
        title={
          selectedConfig
            ? t('classmanagement.veyonConfigTable.editConfig')
            : t('classmanagement.veyonConfigTable.createConfig')
        }
        body={getDialogBody()}
        footer={getFooter()}
      />
      {deleteItem && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen || !!itemToDelete}
          onOpenChange={handleDeleteDialogClose}
          items={[{ id: deleteItem.webdavShareId || '', name: deleteItem.displayName }]}
          onConfirmDelete={handleConfirmDelete}
          titleTranslationKey="settings.appconfig.sections.webdavServer.deleteWebdavServer"
          messageTranslationKey="settings.appconfig.sections.webdavServer.confirmDeleteWebdavServer"
        />
      )}
    </>
  );
};

export default AddWebdavServerDialog;
