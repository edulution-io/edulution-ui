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
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';

type AppConfigButtonsProps = {
  handleDeleteSettingsItem: () => void;
  handleSaveSettingsItem: () => void;
};
const AppConfigFloatingButtons: React.FC<AppConfigButtonsProps> = ({
  handleDeleteSettingsItem,
  handleSaveSettingsItem,
}) => {
  const config: FloatingButtonsBarConfig = {
    buttons: [DeleteButton(handleDeleteSettingsItem), SaveButton(handleSaveSettingsItem)],
    keyPrefix: 'appconfig-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default AppConfigFloatingButtons;
