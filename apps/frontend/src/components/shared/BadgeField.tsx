import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircleOutline, MdAddCircleOutline } from 'react-icons/md';
import cn from '@/lib/utils';
import InputWithChildButton from '@/components/shared/InputWithChildButtons';
import { BadgeSH } from '@/components/ui/BadgeSH';
import Label from '@/components/ui/Label';

interface BadgeFieldProps {
  value: string[];
  onChange: (itemList: string[]) => void;
  labelTranslationId?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

const BadgeField = (props: BadgeFieldProps) => {
  const {
    value: badges,
    onChange: handleChange,
    labelTranslationId,
    placeholder,
    disabled,
    readOnly,
    className,
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
    <>
      {labelTranslationId && (
        <Label>
          <p className="font-bold text-foreground">{t(labelTranslationId)}:</p>
        </Label>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {badges.map((listItem) => (
          <BadgeSH
            key={`badge-${listItem}`}
            className={cn(
              'h-[38px]',
              { 'bg-ciDarkGreyDisabled text-ciGrey': readOnly },
              { 'color-white text-white': !readOnly },
              className,
            )}
          >
            {listItem}
            {!readOnly && (
              <button
                type="button"
                className="ml-2"
                onClick={() => handleRemoveBadge(listItem)}
              >
                <MdRemoveCircleOutline className="h-[24px] w-[24px]" />
              </button>
            )}
          </BadgeSH>
        ))}
        {!readOnly && (
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
    </>
  );
};

export default BadgeField;
