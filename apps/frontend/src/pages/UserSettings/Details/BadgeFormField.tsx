import React from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircleOutline, MdAddCircleOutline } from 'react-icons/md';
import InputWithChildButton from '@/components/shared/InputWithChildButtons';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { FormFieldSH, FormItem } from '@/components/ui/Form';

interface UserSettingsDetailsFormProps {
  formControl: Control;
  value: string[];
  onChange: (mailProxies: string[]) => void;
  fieldName: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const BadgeFormField = (props: UserSettingsDetailsFormProps) => {
  const { value: badges, onChange: handleChange, formControl, fieldName, placeholder, disabled, readOnly } = props;

  const [newLabel, setNewLabel] = React.useState<string>('');

  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={formControl}
      name={fieldName}
      render={() => (
        <FormItem>
          <p className="font-bold">{t('usersettings.details.proxyAddresses')}:</p>
          <div className="flex flex-row flex-wrap gap-2">
            {badges.map((proxyAddress) => (
              <BadgeSH
                key={`badge-${proxyAddress}`}
                className="color-white h-[38px] text-white"
              >
                {proxyAddress}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => {
                    if (!proxyAddress) return;
                    const newMailProxies = badges.filter((mp) => mp !== proxyAddress);
                    handleChange(newMailProxies);
                  }}
                >
                  <MdRemoveCircleOutline className="h-[24px] w-[24px]" />
                </button>
              </BadgeSH>
            ))}
            {!readOnly && !disabled ? (
              <InputWithChildButton
                className="min-w-[250px]"
                placeholder={placeholder}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                inputButtons={[
                  {
                    buttonIcon: MdAddCircleOutline,
                    buttonOnClick: () => {
                      if (!newLabel) return;
                      const updatedBadges = [...badges, newLabel];
                      handleChange(updatedBadges);
                      setNewLabel('');
                    },
                  },
                ]}
              />
            ) : null}
          </div>
        </FormItem>
      )}
    />
  );
};

export default BadgeFormField;
