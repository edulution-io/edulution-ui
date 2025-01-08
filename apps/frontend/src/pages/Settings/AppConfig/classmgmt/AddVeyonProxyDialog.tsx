import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import DeleteBulletinsCategoriesDialog from '@/pages/Settings/AppConfig/bulletinboard/components/DeleteBulletinCategoriesDialog';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import getCreateNewCategorieSchema from '@libs/bulletinBoard/constants/createNewCategorieSchema';
import type VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import useVeyonConfigTableStore from './useVeyonTableStore';
import useAppConfigsStore from '../appConfigsStore';

const AddVeyonProxyDialog = () => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { appConfigs, patchAppConfig } = useAppConfigsStore();
  const { selectedConfig, setSelectedConfig } = useVeyonConfigTableStore();

  const veyonProxyConfig = getExtendedOptionValue(
    appConfigs,
    APPS.CLASS_MANAGEMENT,
    ExtendedOptionKeys.VEYON_PROXYS,
  ) as VeyonProxyItem[];

  const initialFormValues = selectedConfig || {
    subnet: '',
    proxyAdress: '',
  };

  const form = useForm<VeyonProxyItem>({
    mode: 'onChange',
    resolver: zodResolver(getCreateNewCategorieSchema(t)),
    defaultValues: initialFormValues,
  });

  const { reset, control, getValues } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedConfig, reset]);

  const closeDialog = () => {
    setDialogOpen(false);
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

    await patchAppConfig(APPS.CLASS_MANAGEMENT, {
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
      await patchAppConfig(APPS.CLASS_MANAGEMENT, {
        field: 'extendedOptions',
        value: { [ExtendedOptionKeys.VEYON_PROXYS]: newConfig },
      });

      closeDialog();
    }
  };

  const getFooter = () => (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-4"
    >
      <div className="mt-4 flex justify-end space-x-2">
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

  const getDialogBody = () => (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        <FormFieldSH
          control={form.control}
          name="subnet"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <h4>{t(`classmanagement.veyonConfigTable.subnet`)}</h4>
              <FormControl>
                <Input
                  {...field}
                  shouldTrim
                  placeholder={field.name}
                  variant="login"
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
        <FormFieldSH
          control={control}
          name="proxyAdress"
          render={({ field }) => (
            <FormItem>
              <h4>{t(`classmanagement.veyonConfigTable.proxyAdress`)}</h4>
              <FormControl>
                <Input
                  {...field}
                  shouldTrim
                  placeholder={field.name}
                  variant="login"
                />
              </FormControl>
              <p>{t('classmanagement.veyonConfigTable.proxyAdressDescription')}</p>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isDialogOpen}
        handleOpenChange={() => {
          setDialogOpen(false);
          setSelectedConfig(null);
        }}
        title={
          selectedConfig
            ? t('classmanagement.veyonConfigTable.editConfig')
            : t('classmanagement.veyonConfigTable.createConfig')
        }
        body={getDialogBody()}
        footer={getFooter()}
        mobileContentClassName="bg-black h-fit h-max-1/2"
      />
      <DeleteBulletinsCategoriesDialog />
    </>
  );
};

export default AddVeyonProxyDialog;
