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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Form, FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { RowSelectionState } from '@tanstack/react-table';
import { DropdownSelect } from '@/components';
import useLmnApiStore from '@/store/useLmnApiStore';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import appendSlashToUrl from '@libs/common/utils/URL/appendSlashToUrl';
import WEBDAV_SHARE_AUTHENTICATION_METHODS from '@libs/webdav/constants/webdavShareAuthenticationMethods';
import type MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import MultipleSelectorSH from '@/components/ui/MultipleSelectorSH';
import WEBDAV_SHARE_STATUS from '@libs/webdav/constants/webdavShareStatus';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';
import WebdavSharePathPreviewField from './WebdavSharePathPreviewField';

interface AddWebdavShareDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddWebdavShareDialog: React.FC<AddWebdavShareDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { searchGroups } = useGroupStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const {
    selectedRows,
    tableContentData,
    setSelectedRows,
    updateWebdavShare,
    createWebdavShare,
    deleteTableEntry,
    itemToDelete,
    setItemToDelete,
    fetchTableContent,
  } = useWebdavShareConfigTableStore();
  const { tableContentData: rootServers } = useWebdavServerConfigTableStore();
  const lmnUser = useLmnApiStore((s) => s.user);
  const getOwnUser = useLmnApiStore((s) => s.getOwnUser);
  const { isLmn } = useDeploymentTarget();

  const ldapFieldsEnabled = isLmn && !!lmnUser;

  const isOpen = isDialogOpen === tableId;
  const keys = Object.keys(selectedRows as RowSelectionState);
  const isOneRowSelected = keys.length === 1;
  const selectedConfig = selectedRows && isOneRowSelected ? tableContentData[Number(keys[0])] : null;

  const initialFormValues = selectedConfig || {
    [WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER]: rootServers[0]?.displayName,
    [WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.PATH_VARIABLES]: [],
    [WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS]: [],
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
                return !tableContentData.some((s) => s.displayName?.toLowerCase() === val.toLowerCase());
              }
              return true;
            },
            {
              message: t('settings.errors.webdavShareNameAlreadyExists'),
            },
          ),
      }),
    ),
    defaultValues: initialFormValues,
  });

  const { reset, getValues, setValue, control, formState } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedConfig, reset]);

  useEffect(() => {
    void getOwnUser();
  }, []);

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
    const selectedRootServer =
      rootServers.find(
        (server) => server.webdavShareId === webdavShareValues[WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER],
      ) || rootServers[0];
    const newUrl = new URL(webdavShareValues[WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH] || '', selectedRootServer.url);

    const webdavShareDto: WebdavShareDto = {
      ...webdavShareValues,
      url: appendSlashToUrl(newUrl.href),
      rootServer: selectedRootServer?.webdavShareId || '',
      isRootServer: false,
      pathname: appendSlashToUrl(newUrl.pathname),
      type: selectedRootServer?.type || WEBDAV_SHARE_TYPE.LINUXMUSTER,
      authentication: selectedRootServer?.authentication || WEBDAV_SHARE_AUTHENTICATION_METHODS.BASIC,
      status: selectedRootServer?.status || WEBDAV_SHARE_STATUS.DOWN,
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

  const handleVariableChange = (options: MultipleSelectorOptionSH[]) => {
    const uniqueGroups = options.reduce<MultipleSelectorOptionSH[]>((acc, g) => {
      if (!acc.some((x) => x.value === g.value)) acc.push(g);
      return acc;
    }, []);
    setValue(WEBDAV_SHARE_TABLE_COLUMNS.PATH_VARIABLES, uniqueGroups, { shouldValidate: true });
  };

  const getFooter = () => (
    <form onSubmit={handleFormSubmit}>
      <DialogFooterButtons
        handleClose={closeDialog}
        handleSubmit={() => {}}
        handleDelete={selectedConfig ? () => setIsDeleteDialogOpen(true) : undefined}
        disableSubmit={!formState.isValid}
        submitButtonText="common.save"
        submitButtonType="submit"
      />
    </form>
  );

  const rootServerOptions = useMemo(
    () => rootServers?.map((s) => ({ id: s.webdavShareId!, name: s.displayName })) || {},
    [rootServers],
  );
  const pathVariableOptions: MultipleSelectorOptionSH[] = useMemo(() => {
    if (!ldapFieldsEnabled) return [];

    return Object.entries(lmnUser)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => ({
        label: key,
        value: key,
      }));
  }, [ldapFieldsEnabled, lmnUser]);

  const onVariableSearch = (query: string) => {
    if (query.trim() === '') return pathVariableOptions;
    return pathVariableOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  };

  const renderFormFields = () => (
    <>
      <FormField
        name={WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME}
        defaultValue={initialFormValues[WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME]}
        form={form}
        labelTranslationId={t('webdavShare.displayName')}
        variant="dialog"
      />
      <FormFieldSH
        control={form.control}
        name={WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER}
        defaultValue={initialFormValues[WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER]}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('webdavShare.selectRootServer.title')}</p>
            <FormControl>
              <DropdownSelect
                options={rootServerOptions}
                selectedVal={field.value}
                handleChange={field.onChange}
                variant="dialog"
                translate={false}
              />
            </FormControl>
            <FormDescription>{t('webdavShare.selectRootServer.description')}</FormDescription>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormField
        name={WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH}
        defaultValue={selectedConfig ? selectedConfig[WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH] : ''}
        form={form}
        labelTranslationId={t(`webdavShare.${WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH}`)}
        variant="dialog"
      />
      {ldapFieldsEnabled && (
        <FormFieldSH
          control={form.control}
          name={WEBDAV_SHARE_TABLE_COLUMNS.PATH_VARIABLES}
          defaultValue={initialFormValues[WEBDAV_SHARE_TABLE_COLUMNS.PATH_VARIABLES]}
          render={() => (
            <FormItem>
              <p className="font-bold">{t('webdavShare.pathVariables.title')}</p>
              <FormControl>
                <MultipleSelectorSH
                  value={getValues(WEBDAV_SHARE_TABLE_COLUMNS.PATH_VARIABLES)}
                  onSearch={onVariableSearch}
                  onChange={handleVariableChange}
                  placeholder={t('search.type-to-search')}
                  variant="dialog"
                />
              </FormControl>
              <FormDescription>{t('webdavShare.pathVariables.description')}</FormDescription>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
      )}
      <WebdavSharePathPreviewField form={form} />
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
          items={[{ id: deleteItem.webdavShareId || '', name: deleteItem.displayName || '' }]}
          onConfirmDelete={handleConfirmDelete}
          titleTranslationKey="settings.appconfig.sections.webdavShare.deleteWebdavShare"
          messageTranslationKey="settings.appconfig.sections.webdavShare.confirmDeleteWebdavShare"
        />
      )}
    </>
  );
};

export default AddWebdavShareDialog;
