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
import AppConfigDto from '@libs/appconfig/types/appConfigDto';
import { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import type MailProviderConfig from '@libs/appconfig/types/mailProviderConfig';
import { useTranslation } from 'react-i18next';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import DropdownSelect from '@/components/ui/DropdownSelect/DropdownSelect';
import useDockerApplicationStore from '@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore';
import { type ContainerInfo } from 'dockerode';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

type PositionDropdownProps = {
  form: UseFormReturn<{ [settingLocation: string]: AppConfigDto } | ProxyConfigFormType | MailProviderConfig>;
  appConfig: AppConfigDto;
};

type GenericDropdownProps = {
  control: Control<FieldValues>;
  fieldPath: string;
  option: AppConfigExtendedOption;
};

type AppConfigDropdownSelectProps = PositionDropdownProps | GenericDropdownProps;

type FieldWrapperProps = {
  control: Control<FieldValues>;
  name: string;
  title?: string;
  description?: string;
  selectedVal?: string;
  onChange?: (value: string) => unknown;
  options: Array<{ id: string; name: string }>;
  placeholder?: string;
  disabled?: boolean;
  warningTranslationId?: string;
  titleClassName?: string;
};

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  control,
  name,
  title,
  description,
  selectedVal,
  onChange,
  options,
  placeholder,
  disabled = false,
  warningTranslationId,
  titleClassName,
}) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {title && <h4 className={titleClassName}>{t(title)}</h4>}
          <FormControl>
            <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
              <DropdownSelect
                options={options}
                selectedVal={
                  selectedVal ?? (field.value !== undefined && field.value !== null ? String(field.value) : '')
                }
                handleChange={(value) => {
                  const mappedValue = onChange?.(value) ?? value;
                  field.onChange(mappedValue);
                }}
                placeholder={placeholder}
              />
            </div>
          </FormControl>

          {description && <FormDescription>{t(description)}</FormDescription>}

          {disabled && warningTranslationId && <div className="text-sm text-red-400">{t(warningTranslationId)}</div>}

          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

const AppConfigDropdownSelect: React.FC<AppConfigDropdownSelectProps> = (props) => {
  const { language } = useLanguage();
  const { appConfigs } = useAppConfigsStore();

  if ('appConfig' in props) {
    const { form, appConfig } = props;
    const { control, getValues } = form;

    const positionOptions = Array.from({ length: appConfigs.length }).map((_, index) => ({
      id: `${index + 1}`,
      name: `${index + 1}. (${getDisplayName(appConfigs[index], language)})`,
    }));

    const fieldName = `${appConfig.name}.position`;
    const rawSelected = getValues(fieldName);
    const selected =
      typeof rawSelected === 'number' || typeof rawSelected === 'string' ? String(rawSelected) : undefined;

    return (
      <FieldWrapper
        control={control as unknown as Control<FieldValues>}
        name={fieldName}
        title="settings.appconfig.position.title"
        description="settings.appconfig.position.description"
        selectedVal={selected}
        onChange={(val) => Number(val)}
        options={positionOptions}
      />
    );
  }

  const { control, fieldPath, option } = props;

  const [allContainers, setAllContainers] = useState<ContainerInfo[]>([]);
  const { getContainers, isLoading } = useDockerApplicationStore();

  useEffect(() => {
    const fetchContainers = async () => {
      setAllContainers(await getContainers());
    };
    if (option.requiredContainers && option.requiredContainers.length > 0) {
      void fetchContainers();
    }
  }, [option.requiredContainers, getContainers]);

  const areRequiredContainersRunning = useMemo(() => {
    if (!option.requiredContainers || option.requiredContainers.length === 0) return true;
    const list = Array.isArray(allContainers) ? allContainers : [];
    return option.requiredContainers.every((name) =>
      list.some((containerInfo: ContainerInfo) => {
        const names = (containerInfo as unknown as { Names?: string[] }).Names || [];
        const matchesName = Array.isArray(names) ? names.some((n) => n === `/${name}` || n === name) : false;
        return matchesName && containerInfo.State === DOCKER_STATES.RUNNING;
      }),
    );
  }, [allContainers, option.requiredContainers]);

  const computedDisabled =
    (option.requiredContainers && option.requiredContainers.length > 0 ? !areRequiredContainersRunning : false) ||
    false;

  const computedWarning = !isLoading && computedDisabled ? option.disabledWarningText : undefined;

  return (
    <FieldWrapper
      control={control}
      name={fieldPath}
      title={option.title}
      description={option.description}
      options={option.options || []}
      placeholder="common.select"
      disabled={computedDisabled}
      warningTranslationId={computedWarning}
      titleClassName="text-background"
    />
  );
};

export default AppConfigDropdownSelect;
