import React from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircleOutline, MdAddCircleOutline } from 'react-icons/md';
import InputWithChildButton from '@/components/shared/InputWithChildButtons';
import { FormFieldSH, FormItem, FormLabel } from '@/components/ui/Form';
import { BadgeSH } from '@/components/ui/BadgeSH';

interface UserSettingsDetailsFormProps {
  formControl: Control;
  value: string[];
  onChange: (itemList: string[]) => void;
  fieldName: string;
  labelTranslationId?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const BadgeFormField = (props: UserSettingsDetailsFormProps) => {
  const {
    value: badges,
    onChange: handleChange,
    formControl,
    fieldName,
    labelTranslationId,
    placeholder,
    disabled,
    readOnly,
  } = props;

  const [newLabel, setNewLabel] = React.useState<string>('');

  const { t } = useTranslation();

  const handleRemoveBadge = (listItem: string) => {
    if (!listItem) return;
    const newList = badges.filter((mp) => mp !== listItem);
    handleChange(newList);
  };

  const handleAddBadge = () => {
    if (!newLabel) return;
    const updatedBadges = [...badges, newLabel];
    handleChange(updatedBadges);
    setNewLabel('');
  };

  return (
    <FormFieldSH
      control={formControl}
      name={fieldName}
      render={() => (
        <FormItem>
          {labelTranslationId && (
            <FormLabel>
              <p className="font-bold text-ciLightGrey">{t(labelTranslationId)}:</p>
            </FormLabel>
          )}
          <div className="flex flex-row flex-wrap gap-2">
            {badges.map((listItem) => (
              <BadgeSH
                key={`badge-${listItem}`}
                className="color-white h-[38px] text-white"
              >
                {listItem}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => handleRemoveBadge(listItem)}
                >
                  <MdRemoveCircleOutline className="h-[24px] w-[24px]" />
                </button>
              </BadgeSH>
            ))}
            {!readOnly && !disabled && (
              <InputWithChildButton
                className="min-w-[250px]"
                placeholder={placeholder}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                disabled={disabled || !newLabel}
                inputButtons={[
                  {
                    Icon: MdAddCircleOutline,
                    onClick: handleAddBadge,
                  },
                ]}
              />
            )}
          </div>
        </FormItem>
      )}
    />
  );
};

export default BadgeFormField;
