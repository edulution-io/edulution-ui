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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { DropdownSelect } from '@/components';
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import NATIVE_APP_CONFIG_OPTIONS from '@/pages/Settings/AppConfig/nativeAppConfigOptions';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { useNavigate } from 'react-router-dom';
import useIsMobileView from '@/hooks/useIsMobileView';
import CircleLoader from '@/components/ui/CircleLoader';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import TApps from '@libs/appconfig/types/appsType';
import APPS from '@libs/appconfig/constants/apps';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { useForm } from 'react-hook-form';

const AddAppConfigDialog: React.FC = () => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const navigate = useNavigate();
  const { isAddAppConfigDialogOpen, appConfigs, setIsAddAppConfigDialogOpen, createAppConfig, isLoading, error } =
    useAppConfigsStore();
  const [option, setOption] = useState<string>(`${APPS.CUSTOM}.sidebar`);

  const selectedOption = option.toLowerCase().split('.')[0] as TApps;
  const isCustomAppSelected = selectedOption === APPS.CUSTOM;

  const filteredAppOptions = useMemo(() => {
    const existingOptions = appConfigs.map((item) => item.name);
    const filteredOptions = NATIVE_APP_CONFIG_OPTIONS.filter(
      (item) => !existingOptions.includes(item.id) || item.id === APPS.CUSTOM,
    );
    return filteredOptions.map((item) => ({ id: item.id, name: `${item.id}.sidebar` }));
  }, [appConfigs]);

  const form = useForm({
    mode: 'onSubmit',
    resolver: undefined,
  });

  useEffect(() => {
    if (isCustomAppSelected) {
      form.setValue('name', '');
    }
  }, [selectedOption]);

  const onSubmit = async () => {
    if (!selectedOption) {
      return;
    }
    const optionsConfig = NATIVE_APP_CONFIG_OPTIONS.find((item) => item.id.includes(selectedOption));

    if (optionsConfig) {
      const newConfig: AppConfigDto = {
        name: selectedOption,
        icon: optionsConfig.icon,
        appType: APP_INTEGRATION_VARIANT.FORWARDED,
        options: {},
        accessGroups: [],
        extendedOptions: {},
      };

      await createAppConfig(newConfig);
      if (!error) {
        setOption(`${APPS.CUSTOM}.sidebar`);
        setIsAddAppConfigDialogOpen(false);
        navigate(`/${SETTINGS_PATH}/${selectedOption}`);
      }
    }
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return (
      <>
        <div className="my-12">
          <p>{t('settings.addApp.description')}</p>
          <DropdownSelect
            options={filteredAppOptions}
            selectedVal={t(option)}
            handleChange={setOption}
            openToTop={isMobileView}
          />
        </div>
        <Form {...form}>
          <form className="mt-4">
            {isCustomAppSelected ? (
              <FormField
                name="name"
                defaultValue=""
                form={form}
                labelTranslationId={t('common.name')}
                variant="dialog"
                className=""
              />
            ) : null}
            <div className="mt-12 flex justify-end">
              <Button
                type="submit"
                variant="btn-collaboration"
                size="lg"
                onClick={onSubmit}
                disabled={isLoading || !selectedOption}
              >
                {t('common.add')}
              </Button>
            </div>
          </form>
        </Form>
      </>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isAddAppConfigDialogOpen}
      handleOpenChange={() => setIsAddAppConfigDialogOpen(false)}
      title={t('settings.addApp.title')}
      body={getDialogBody()}
    />
  );
};

export default AddAppConfigDialog;
