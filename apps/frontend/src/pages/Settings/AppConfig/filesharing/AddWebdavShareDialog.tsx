/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useMemo } from 'react';
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
import { DropdownSelect } from '@/components';
import useLmnApiStore from '@/store/useLmnApiStore';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import appendSlashToUrl from '@libs/common/utils/URL/appendSlashToUrl';
import WEBDAV_SHARE_AUTHENTICATION_METHODS from '@libs/webdav/constants/webdavShareAuthenticationMethods';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';
import WebdavSharePathPreviewField from './WebdavSharePathPreviewField';

interface AddWebdavShareDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddWebdavShareDialog: React.FC<AddWebdavShareDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { selectedRows, tableContentData, setSelectedRows, updateWebdavShare, createWebdavShare, deleteTableEntry } =
    useWebdavShareConfigTableStore();
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
    [WEBDAV_SHARE_TABLE_COLUMNS.URL]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.VARIABLE]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.IS_ROOT_PATH]: false,
    [WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS]: [],
    [WEBDAV_SHARE_TABLE_COLUMNS.TYPE]: WEBDAV_SHARE_TYPE.LINUXMUSTER,
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
      rootServers.find((server) => server.displayName === webdavShareValues[WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER]) ||
      rootServers[0];
    const newUrl = new URL(webdavShareValues[WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH] || '', selectedRootServer.url);

    const webdavShareDto: WebdavShareDto = {
      ...webdavShareValues,
      url: appendSlashToUrl(newUrl.href),
      rootServer: selectedRootServer.webdavShareId || '',
      pathname: appendSlashToUrl(newUrl.pathname),
      type: selectedRootServer?.type || WEBDAV_SHARE_TYPE.LINUXMUSTER,
      authentication: selectedRootServer?.authentication || WEBDAV_SHARE_AUTHENTICATION_METHODS.BASIC,
    };

    if (selectedConfig) {
      void updateWebdavShare(selectedConfig?.webdavShareId || '', webdavShareDto);
    } else {
      void createWebdavShare(webdavShareDto);
    }

    closeDialog();
  };

  const handleDeleteWebdavShareConfig = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedConfig?.webdavShareId && deleteTableEntry) {
      void deleteTableEntry('', selectedConfig?.webdavShareId);
    }
    closeDialog();
  };

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const uniqueGroups = newGroups.reduce<MultipleSelectorGroup[]>((acc, g) => {
      if (!acc.some((x) => x.value === g.value)) acc.push(g);
      return acc;
    }, []);
    setValue(WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS, uniqueGroups, { shouldValidate: true });
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
            onClick={handleDeleteWebdavShareConfig}
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

  const rootServerOptions = useMemo(
    () => rootServers.map((s) => ({ id: s.webdavShareId!, name: s.displayName })),
    [rootServers],
  );
  const pathVariableOptions = useMemo(() => {
    const items = ldapFieldsEnabled
      ? Object.entries(lmnUser).map(([key, value]) => ({
          id: key,
          name: key,
          value: String(value),
        }))
      : [];

    return [{ id: '', name: '-', value: '' }, ...items];
  }, [ldapFieldsEnabled, lmnUser]);

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
          name={WEBDAV_SHARE_TABLE_COLUMNS.VARIABLE}
          defaultValue={initialFormValues[WEBDAV_SHARE_TABLE_COLUMNS.VARIABLE]}
          render={({ field }) => (
            <FormItem>
              <p className="font-bold">{t('webdavShare.variable.title')}</p>
              <FormControl>
                <DropdownSelect
                  options={pathVariableOptions}
                  selectedVal={field.value}
                  handleChange={field.onChange}
                  variant="dialog"
                  translate={false}
                />
              </FormControl>
              <FormDescription>{t('webdavShare.variable.description')}</FormDescription>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
      )}
      <WebdavSharePathPreviewField
        form={form}
        variableList={pathVariableOptions}
        ldapFieldsEnabled={ldapFieldsEnabled}
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
    </>
  );

  const getDialogBody = () => (
    <Form {...form}>
      <form className="space-y-4">{renderFormFields()}</form>
    </Form>
  );

  return (
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
  );
};

export default AddWebdavShareDialog;
