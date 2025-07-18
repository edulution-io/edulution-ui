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
import { FormControl, FormDescription, FormFieldSH, FormItem } from '@/components/ui/Form';
import { DropdownSelect } from '@/components';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import APPLICATION_NAME from '@libs/common/constants/applicationName';

type DeploymentTargetDropdownSelectFormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
};

const DEPLOYMENT_TARGET_IDS = Object.values(DEPLOYMENT_TARGET);

const DeploymentTargetDropdownSelectFormField = <T extends FieldValues>({
  form,
}: DeploymentTargetDropdownSelectFormFieldProps<T>) => {
  const { t } = useTranslation();

  const deploymentTargetOptions = DEPLOYMENT_TARGET_IDS.map((id) => ({
    id,
    name: t(`deploymentTarget.${id}`),
  }));

  return (
    <FormFieldSH
      control={form.control}
      name={'general.deploymentTarget' as Path<T>}
      defaultValue={t(`deploymentTarget.${DEPLOYMENT_TARGET.LINUXMUSTER}`) as PathValue<T, Path<T>>}
      render={({ field }) => (
        <FormItem>
          <p className="font-bold">{t('deploymentTarget.title')}</p>
          <FormControl>
            <DropdownSelect
              options={deploymentTargetOptions}
              selectedVal={field.value}
              handleChange={field.onChange}
            />
          </FormControl>
          <FormDescription>{t('deploymentTarget.description', { appName: APPLICATION_NAME })}</FormDescription>
        </FormItem>
      )}
    />
  );
};

export default DeploymentTargetDropdownSelectFormField;
