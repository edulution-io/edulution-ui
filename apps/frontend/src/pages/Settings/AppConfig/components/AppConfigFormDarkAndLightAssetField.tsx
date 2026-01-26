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
