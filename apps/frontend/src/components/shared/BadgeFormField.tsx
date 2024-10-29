import React from 'react';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MdRemoveCircleOutline, MdAddCircleOutline } from 'react-icons/md';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import { FormControl, FormFieldSH, FormItem, FormLabel } from '@/components/ui/Form';
import { BadgeSH } from '@/components/ui/BadgeSH';

type BadgeFormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  disabled?: boolean;
  name: Path<T> | string;
  labelTranslationId: string;
  defaultValue?: string[];
  placeholder?: string;
  readOnly?: boolean;
};

const BadgeFormField = <T extends FieldValues>({
  form,
  disabled,
  name,
  labelTranslationId,
  defaultValue,
  placeholder,
  readOnly = false,
}: BadgeFormFieldProps<T>) => {
  const { t } = useTranslation();

  const [newLabel, setNewLabel] = React.useState<string>('');

  const handleRemoveBadge = (
    currentValue: string[],
    removeLabel: string,
    handleChange?: (updatedValue: string[]) => void,
  ) => {
    if (!currentValue || !removeLabel || !handleChange) return;
    const newList = currentValue.filter((mp) => mp !== removeLabel);
    handleChange(newList);
  };

  const handleAddBadge = (
    currentValue: string[],
    addLabel: string,
    handleChange?: (updatedValue: string[]) => void,
  ) => {
    if (!currentValue || !addLabel || !handleChange) return;
    const alreadyExists = currentValue.findIndex((mp) => mp === addLabel);
    if (alreadyExists !== -1) {
      toast.error(t('usersettings.details.badgeAlreadyExists'));
      return;
    }
    const updatedBadges = [...currentValue, addLabel];
    handleChange(updatedBadges);
    setNewLabel('');
  };

  const badges = form.watch(name as Path<T>) as string[];
  return (
    <FormFieldSH
      control={form.control}
      disabled={disabled}
      name={name as Path<T>}
      defaultValue={defaultValue as PathValue<T, Path<T>>}
      render={({ field }) => (
        <FormItem>
          {labelTranslationId && (
            <FormLabel>
              <p className="font-bold text-ciLightGrey">{t(labelTranslationId)}</p>
            </FormLabel>
          )}
          <FormControl>
            <div className="flex flex-row flex-wrap gap-2">
              {badges?.map((listItem) => (
                <BadgeSH
                  key={`badge-${listItem}`}
                  className="color-white h-[36px] text-white"
                >
                  {listItem}
                  <button
                    type="button"
                    className="ml-2"
                    onClick={() => handleRemoveBadge(badges, listItem, field.onChange)}
                  >
                    <MdRemoveCircleOutline className="h-[24px] w-[24px]" />
                  </button>
                </BadgeSH>
              ))}
              {!readOnly && (
                <InputWithActionIcons
                  className="h-[36px] min-w-[250px] rounded-md"
                  placeholder={placeholder}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  disabled={disabled || !newLabel}
                  actionIcons={[
                    {
                      icon: MdAddCircleOutline,
                      onClick: () => handleAddBadge(badges, newLabel, field.onChange),
                    },
                  ]}
                />
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default BadgeFormField;
