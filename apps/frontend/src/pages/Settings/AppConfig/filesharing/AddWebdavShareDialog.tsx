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
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import FormField from '@/components/shared/FormField';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';

interface AddWebdavShareDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddWebdavShareDialog: React.FC<AddWebdavShareDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { selectedConfig, setSelectedConfig, updateWebdavShare, createWebdavShare, deleteWebdavShare } =
    useWebdavShareConfigTableStore();
  const isOpen = isDialogOpen === tableId;

  const initialFormValues = selectedConfig || {
    [WEBDAV_SHARE_TABLE_COLUMNS.URL]: '',
    [WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS]: [],
  };

  const form = useForm<WebdavShareDto>({
    mode: 'onSubmit',
    resolver: zodResolver(
      z.object({
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
    setSelectedConfig(null);
    reset();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { url, accessGroups } = getValues();
    if (selectedConfig) {
      void updateWebdavShare(selectedConfig?.webdavShareId || '', { url, accessGroups });
    } else {
      void createWebdavShare({ url, accessGroups });
    }

    closeDialog();
  };

  const handleDeleteWebdavShareConfig = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedConfig?.webdavShareId) {
      void deleteWebdavShare(selectedConfig?.webdavShareId);
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

  const renderFormFields = () => (
    <>
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
            <p className="font-bold">{t('permission.groups')}</p>
            <FormControl>
              <AsyncMultiSelect<MultipleSelectorGroup>
                value={getValues(WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS)}
                onSearch={searchGroups}
                onChange={handleGroupsChange}
                placeholder={t('search.type-to-search')}
                variant="dialog"
              />
            </FormControl>
            <p className="text-background">{t('settings.globalSettings.selectUserGroups')}</p>
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

export default AddWebdavShareDialog;
