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
              searchEnabled={false}
            />
          </FormControl>
          <FormDescription>{t('deploymentTarget.description', { appName: APPLICATION_NAME })}</FormDescription>
        </FormItem>
      )}
    />
  );
};

export default DeploymentTargetDropdownSelectFormField;
