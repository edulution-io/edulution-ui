import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@/components/shared/Input';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/constants/appConfigExtendedOption';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import getExtendedOptions from '@libs/appconfig/utils/getExtendedOptionValue';

type ExtendedOptionsFormProps<T extends FieldValues> = {
  extendedOptions: AppConfigExtendedOption[] | undefined;
  form: UseFormReturn<T>;
  baseName?: string;
};

const ExtendedOptionsForm = <T extends FieldValues>({
  extendedOptions,
  form,
  baseName,
}: ExtendedOptionsFormProps<T>) => {
  const { register, setValue } = form;
  const { appConfigs } = useAppConfigsStore();
  const { t } = useTranslation();

  useEffect(() => {
    extendedOptions?.forEach((option) => {
      const fieldName = (baseName ? `${baseName}.extendedOptions.${option.name}` : option.name) as Path<T>;
      const initialValue = getExtendedOptions(appConfigs, baseName || '', option.name) as PathValue<T, Path<T>>;
      setValue(fieldName, initialValue);
    });
  }, [extendedOptions, setValue, baseName]);

  const getComponent = ({ description, name, type }: AppConfigExtendedOption) => {
    const fieldName = (baseName ? `${baseName}.extendedOptions.${name}` : name) as Path<T>;
    switch (type) {
      case ExtendedOptionField.input:
        return (
          <Input
            id={fieldName}
            {...register(fieldName)}
            type="text"
            placeholder={t(description)}
            className="input-class"
            defaultValue="fewfewefwfew"
            autoComplete="off"
          />
        );
      case ExtendedOptionField.password:
        return (
          <Input
            id={fieldName}
            {...register(fieldName)}
            type="password"
            placeholder={t(description)}
            defaultValue="fewfewefwfew"
            className="input-class"
            autoComplete="new-password"
          />
        );
      default:
        return null;
    }
  };

  return (
    <form
      className="space-y-4"
      autoComplete="off"
    >
      {extendedOptions?.map((option) => {
        const fieldName = baseName ? `${baseName}.${option.name}` : option.name;

        return (
          <div
            key={option.name}
            className="form-group"
          >
            {getComponent(option)}
            <label htmlFor={fieldName}>{t(option.title)}</label>
          </div>
        );
      })}
    </form>
  );
};

export default ExtendedOptionsForm;
