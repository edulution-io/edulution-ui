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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { DropdownSelect } from '@/components';
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { useNavigate } from 'react-router-dom';
import useIsMobileView from '@/hooks/useIsMobileView';
import CircleLoader from '@/components/ui/CircleLoader';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';

interface AddAppConfigDialogProps {
  option: string;
  setOption: (option: string) => void;
  getFilteredAppOptions: () => { id: string; name: string }[];
}

const AddAppConfigDialog: React.FC<AddAppConfigDialogProps> = ({ option, setOption, getFilteredAppOptions }) => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const navigate = useNavigate();
  const { isAddAppConfigDialogOpen, setIsAddAppConfigDialogOpen, createAppConfig, isLoading, error } =
    useAppConfigsStore();
  const selectedOption = option.toLowerCase().split('.')[0];

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return (
      <div className="my-12 text-background">
        <p>{t('settings.addApp.description')}</p>
        <DropdownSelect
          options={getFilteredAppOptions()}
          selectedVal={t(option)}
          handleChange={setOption}
          openToTop={isMobileView}
          variant="dialog"
        />
      </div>
    );
  };

  const onSubmit = async () => {
    if (!selectedOption) {
      return;
    }
    const optionsConfig = APP_CONFIG_OPTIONS.find((item) => item.id.includes(selectedOption));

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
        setOption('');
        setIsAddAppConfigDialogOpen(false);
      }
    }
  };

  useEffect(() => {
    if (selectedOption && !isAddAppConfigDialogOpen) {
      navigate(`/${SETTINGS_PATH}/${selectedOption}`);
    }
  }, [isAddAppConfigDialogOpen, selectedOption]);

  const dialogFooter = (
    <div className="mt-4 flex justify-end">
      <Button
        type="button"
        variant="btn-collaboration"
        size="lg"
        onClick={onSubmit}
        disabled={isLoading || !selectedOption}
      >
        {t('common.add')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isAddAppConfigDialogOpen}
      handleOpenChange={() => setIsAddAppConfigDialogOpen(false)}
      title={t('settings.addApp.title')}
      body={getDialogBody()}
      footer={dialogFooter}
    />
  );
};

export default AddAppConfigDialog;
