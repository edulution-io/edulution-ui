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

import React, { useEffect, useMemo, useState } from 'react';
import { FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DropdownSelect from '@/components/ui/DropdownSelect/DropdownSelect';
import useDockerApplicationStore from '@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore';
import { type ContainerInfo } from 'dockerode';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

type AppConfigDropdownSelectProps = {
  control: Control<FieldValues>;
  fieldPath: string;
  option: AppConfigExtendedOption;
};

const AppConfigDropdownSelect = (props: AppConfigDropdownSelectProps) => {
  const { t } = useTranslation();

  const { control, fieldPath, option } = props;

  const { getContainers } = useDockerApplicationStore();
  const [hasFetched, setHasFetched] = useState(false);

  const [allContainers, setAllContainers] = useState<ContainerInfo[] | null>(null);

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setAllContainers(await getContainers());
      } finally {
        setHasFetched(true);
      }
    };

    if (option.requiredContainers && option.requiredContainers.length > 0) {
      void fetchContainers();
    } else {
      setHasFetched(true);
    }
  }, [getContainers, (option.requiredContainers ?? []).join('|')]);

  const areRequiredContainersRunning = useMemo(() => {
    if (!option.requiredContainers || option.requiredContainers.length === 0) return true;
    if (!allContainers) return false;

    return option.requiredContainers.every((name) =>
      allContainers.some((containerInfo) => {
        const names = (containerInfo as unknown as { Names?: string[] }).Names || [];
        const matchesName = names.some((n) => n === `/${name}` || n === name);
        return matchesName && containerInfo.State === DOCKER_STATES.RUNNING;
      }),
    );
  }, [allContainers, (option.requiredContainers ?? []).join('|')]);

  const computedDisabled = !!option.requiredContainers?.length && !areRequiredContainersRunning;
  const computedWarning = hasFetched && computedDisabled ? option.disabledWarningText : undefined;

  return (
    <FormFieldSH
      control={control}
      name={fieldPath}
      render={({ field }) => (
        <FormItem>
          {option.title && <p className="font-bold">{t(option.title)}</p>}
          <FormControl>
            <div className={computedDisabled ? 'pointer-events-none opacity-60' : ''}>
              <DropdownSelect
                options={option.options || []}
                selectedVal={(field.value as string) || ''}
                handleChange={field.onChange}
                placeholder="common.select"
              />
            </div>
          </FormControl>

          {option.description && <FormDescription>{t(option.description)}</FormDescription>}

          {computedDisabled && computedWarning && <div className="text-sm">{t(computedWarning)}</div>}

          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigDropdownSelect;
