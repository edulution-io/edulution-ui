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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import CreateDockerContainerDialog from '@/pages/Settings/AppConfig/DockerIntegration/CreateDockerContainerDialog';
import useSelectCreateDockerContainerDialogStore from '@/pages/Settings/AppConfig/DockerIntegration/SelectCreateDockerContainerDialog/useSelectCreateDockerContainerDialogStore';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APP_CONFIG_OPTIONS from '@/pages/Settings/AppConfig/appConfigOptions';
import AppConfigSectionsKeys from '@libs/appconfig/constants/appConfigSectionsKeys';
import getDisplayName from '@/utils/getDisplayName';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useLanguage from '@/hooks/useLanguage';
import TApps from '@libs/appconfig/types/appsType';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import { EDULUTION_MANAGER_APPLICATION_NAME } from '@libs/docker/constants/edulution-manager';
import useDockerApplicationStore from '@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore';
import DropdownSelect, { DropdownOptions } from '../../../../../components/ui/DropdownSelect/DropdownSelect';

const SelectCreateDockerContainerDialog: React.FC = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { language } = useLanguage();
  const { isDialogOpen: isSelectDialogOpen, setDialogOpen: setSelectDialogOpen } =
    useSelectCreateDockerContainerDialogStore();
  const { setDialogOpen: setIsCreateDialogOpen, isDialogOpen: isCreateDialogOpen } = useAppConfigTableDialogStore();
  const [selectedValue, setSelectedValue] = React.useState<string>('');
  const { fetchTableContent, getContainers } = useDockerApplicationStore();

  useEffect(() => {
    if (!isCreateDialogOpen) {
      void getContainers();
    }
  }, [isCreateDialogOpen]);

  const appOptions = APP_CONFIG_OPTIONS.filter(
    (option) => option.extendedOptions?.[AppConfigSectionsKeys.docker] !== undefined,
  )
    .map((option) => {
      const config = appConfigs.find((appConfig) => appConfig.name === option.id);
      if (!config) return undefined;
      return { ...option, name: getDisplayName(config, language) };
    })
    .filter(Boolean) as DropdownOptions[];

  const eduManagerAgentOption = {
    id: EDULUTION_MANAGER_APPLICATION_NAME,
    name: `${EDULUTION_MANAGER_APPLICATION_NAME}.title`,
  };

  const handleClose = () => setSelectDialogOpen(false);

  const getDialogBody = () => (
    <>
      <DropdownSelect
        options={[...appOptions, eduManagerAgentOption]}
        selectedVal={selectedValue}
        handleChange={setSelectedValue}
        variant="dialog"
      />
      <p>{t('dockerOverview.selectPluginForInstallationDescription')}</p>
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={async () => {
          await fetchTableContent(selectedValue as TApps);
          setIsCreateDialogOpen(ExtendedOptionKeys.DOCKER_CONTAINER_TABLE);
          handleClose();
        }}
        cancelButtonText="common.cancel"
        submitButtonText="select"
        submitButtonType="submit"
      />
    </>
  );

  return (
    <>
      <AdaptiveDialog
        title={t(`dockerOverview.selectPluginForInstallationTitle`)}
        isOpen={isSelectDialogOpen}
        body={getDialogBody()}
        handleOpenChange={handleClose}
      />
      <CreateDockerContainerDialog
        settingLocation={selectedValue as TApps}
        tableId={ExtendedOptionKeys.DOCKER_CONTAINER_TABLE}
      />
    </>
  );
};

export default SelectCreateDockerContainerDialog;
