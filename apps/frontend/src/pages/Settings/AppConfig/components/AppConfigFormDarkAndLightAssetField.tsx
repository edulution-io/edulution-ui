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
import { UseFormReturn } from 'react-hook-form';
import THEME from '@libs/common/constants/theme';
import ThemeType from '@libs/common/types/themeType';
import ThemedFile from '@libs/common/types/themedFile';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import AssetType from '@libs/appconfig/types/assetType';
import AppConfigFormAssetField from '@/pages/Settings/AppConfig/components/AppConfigFormAssetField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

export type AppConfigFormDarkAndLightAssetFieldProps = {
  settingLocation: string;
  fieldPath: string;
  option: AppConfigExtendedOption;
  form: UseFormReturn<ThemedFile>;
  assetType?: AssetType;
  onUploadSuccess?: (variant: ThemeType) => void;
};

const AppConfigFormDarkAndLightAssetField: React.FC<AppConfigFormDarkAndLightAssetFieldProps> = ({
  settingLocation,
  fieldPath,
  option,
  form,
  assetType = ASSET_TYPES.logo,
  onUploadSuccess,
}) => (
  <div className="flex flex-grow flex-col gap-4 lg:flex-row">
    <AppConfigFormAssetField
      variant={THEME.light}
      appName={settingLocation}
      fieldPath={fieldPath}
      option={option}
      form={form}
      assetType={assetType}
      onUploadSuccess={onUploadSuccess}
    />
    <AppConfigFormAssetField
      variant={THEME.dark}
      appName={settingLocation}
      fieldPath={fieldPath}
      option={option}
      form={form}
      assetType={assetType}
      onUploadSuccess={onUploadSuccess}
    />
  </div>
);

export default AppConfigFormDarkAndLightAssetField;
