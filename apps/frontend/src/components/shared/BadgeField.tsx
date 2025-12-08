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
        {isEmpty && (
          <BadgeSH className={cn('bg-ciDarkGreyDisabled px-4 text-ciGrey', className)}>{t('common.none')}</BadgeSH>
        )}
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
