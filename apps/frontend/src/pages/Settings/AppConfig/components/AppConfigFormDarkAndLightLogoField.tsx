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
import ThemedFile from '@libs/common/types/themedFile';
import AppConfigFormLogoField from '@/pages/Settings/AppConfig/components/AppConfigFormLogoField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

export type AppConfigFormDarkAndLightLogoFieldProps = {
  settingLocation: string;
  fieldPath: string;
  option: AppConfigExtendedOption;
  form: UseFormReturn<ThemedFile>;
};

const AppConfigFormDarkAndLightLogoField: React.FC<AppConfigFormDarkAndLightLogoFieldProps> = ({
  settingLocation,
  fieldPath,
  option,
  form,
}) => (
  <div className="flex flex-grow flex-col gap-4 lg:flex-row">
    <AppConfigFormLogoField
      variant={THEME.light}
      appName={settingLocation}
      fieldPath={fieldPath}
      option={option}
      form={form}
    />
    <AppConfigFormLogoField
      variant={THEME.dark}
      appName={settingLocation}
      fieldPath={fieldPath}
      option={option}
      form={form}
    />
  </div>
);

export default AppConfigFormDarkAndLightLogoField;
