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

import React, { useEffect } from 'react';
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
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';

interface AddWebdavServerDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddWebdavServerDialog: React.FC<AddWebdavServerDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { selectedRows, tableContentData, setSelectedRows, deleteTableEntry } = useWebdavServerConfigTableStore();
  const { updateWebdavShare, createWebdavShare } = useWebdavShareConfigTableStore();
  const isOpen = isDialogOpen === tableId;
  const keys = Object.keys(selectedRows as RowSelectionState);
  const isOneRowSelected = keys.length === 1;
  const selectedConfig = selectedRows && isOneRowSelected ? tableContentData[Number(keys[0])] : null;

  const initialFormValues = selectedConfig || {
    [WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.URL]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.PATHNAME]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.IS_ROOT_PATH]: true,
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
    const webdavShareDto: WebdavShareDto = { ...webdavShareValues, pathname: new URL(webdavShareValues.url).pathname };
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

  const webdavShareTypeOptions = Object.values(WEBDAV_SHARE_TYPE).map((id) => ({
    id,
    name: t(`webdavShare.type.${id}`),
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

export default AddWebdavServerDialog;
