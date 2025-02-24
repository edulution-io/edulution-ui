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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import type FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';
import APPS from '@libs/appconfig/constants/apps';

interface AppStoreFloatingButtonsProps {
  handleCreateApp: () => void;
  selectedApp: AppConfigOption;
}

const AppStoreFloatingButtons: React.FC<AppStoreFloatingButtonsProps> = ({ handleCreateApp, selectedApp }) => {
  const { t } = useTranslation();
  const areButtonsVisible = selectedApp.id !== APPS.NONE;

  const appStoreFloatingButtonsConfig: FloatingButtonsBarProps = {
    config: {
      buttons: [
        {
          icon: MdAdd,
          text: t(`common.add`),
          onClick: handleCreateApp,
          isVisible: areButtonsVisible,
        },
      ],
      keyPrefix: 'appstore-page-floating-button_',
    },
  };

  return areButtonsVisible ? <FloatingButtonsBar {...appStoreFloatingButtonsConfig} /> : null;
};

export default AppStoreFloatingButtons;
