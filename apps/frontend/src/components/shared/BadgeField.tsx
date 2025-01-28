import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircleOutline, MdAddCircleOutline } from 'react-icons/md';
import cn from '@libs/common/utils/className';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import { BadgeSH } from '@/components/ui/BadgeSH';
import Label from '@/components/ui/Label';

interface BadgeFieldProps {
  value: string[];
  onChange?: (itemList: string[]) => void;
  labelTranslationId?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

const BadgeField = (props: BadgeFieldProps) => {
  const {
    value: badges,
    onChange: handleChange = () => {},
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
    const newList = badges.filter((str) => str !== listItem);
    handleChange(newList);
  };

  const handleAddBadge = () => {
    if (!newLabel) return;
    const updatedBadges = [...badges, newLabel];
    handleChange(updatedBadges);
    setNewLabel('');
  };

  const isEmpty = badges.length === 0;
  return (
    <>
      {labelTranslationId && (
        <Label>
          <p className="font-bold text-background">{t(labelTranslationId)}</p>
        </Label>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {isEmpty && <BadgeSH className={cn('bg-secondary px-4', className)}>{t('common.none')}</BadgeSH>}
        {!isEmpty &&
          badges.map((listItem, index) => (
            <BadgeSH
              // eslint-disable-next-line react/no-array-index-key
              key={`badge${index}_-_${listItem}`}
              className={cn(
                'h-[36px] py-0',
                { 'bg-ciDarkGreyDisabled text-ciGrey': readOnly },
                { 'color-background text-background': !readOnly },
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
          <InputWithActionIcons
            className="min-w-[250px]"
            placeholder={placeholder}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            disabled={disabled || !newLabel}
            actionIcons={[
              {
                icon: MdAddCircleOutline,
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
