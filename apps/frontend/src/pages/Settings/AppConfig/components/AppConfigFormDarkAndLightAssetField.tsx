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
import { FieldValues, UseFormReturn } from 'react-hook-form';
import THEME from '@libs/common/constants/theme';
import { ResolvedThemeType } from '@libs/common/types/themeType';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import AssetType from '@libs/appconfig/types/assetType';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import AppConfigFormAssetField from '@/pages/Settings/AppConfig/components/AppConfigFormAssetField';

type AppConfigFormDarkAndLightAssetFieldProps<T extends FieldValues = FieldValues> = {
  settingLocation: string;
  fieldPath: string;
  option: AppConfigExtendedOption;
  form: UseFormReturn<T>;
  assetType?: AssetType;
  onUploadSuccess?: (variant?: ResolvedThemeType) => void;
};

const AppConfigFormDarkAndLightAssetField = <T extends FieldValues = FieldValues>({
  settingLocation,
  fieldPath,
  option,
  form,
  assetType = ASSET_TYPES.logo,
  onUploadSuccess,
}: AppConfigFormDarkAndLightAssetFieldProps<T>) => {
  const { t } = useTranslation();

  const getTitle = (variant: ResolvedThemeType) => {
    if (!option.title) return undefined;
    const variantText = t(`appExtendedOptions.appLogo.${variant}`);
    return t(option.title, { variant: variantText });
  };

  return (
    <div className="flex flex-grow flex-col gap-4 lg:flex-row">
      <AppConfigFormAssetField
        variant={THEME.light}
        settingLocation={settingLocation}
        fieldPath={fieldPath}
        form={form}
        assetType={assetType}
        title={getTitle(THEME.light)}
        onUploadSuccess={onUploadSuccess}
      />
      <AppConfigFormAssetField
        variant={THEME.dark}
        settingLocation={settingLocation}
        fieldPath={fieldPath}
        form={form}
        assetType={assetType}
        title={getTitle(THEME.dark)}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};

export default AppConfigFormDarkAndLightAssetField;
