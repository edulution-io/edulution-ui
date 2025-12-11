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
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MdAddCircleOutline, MdRemoveCircleOutline } from 'react-icons/md';
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
    currentBadgeLabels: string[],
    badgeLabelToRemove: string,
    updateBadgeLabels?: (badges: string[]) => void,
  ) => {
    if (currentBadgeLabels.length === 0 || !badgeLabelToRemove || !updateBadgeLabels) return;
    const newList = currentBadgeLabels.filter((mp) => mp !== badgeLabelToRemove);
    updateBadgeLabels(newList);
  };

  const handleAddBadge = (
    currentBadgeLabels: string[],
    badgeLabelToAdd: string,
    updateBadgeLabels?: (badges: string[]) => void,
  ) => {
    if (currentBadgeLabels.length === 0 || !badgeLabelToAdd || !updateBadgeLabels) return;
    const badgeAlreadyExists = currentBadgeLabels.includes(badgeLabelToAdd);
    if (badgeAlreadyExists) {
      toast.error(t('usersettings.details.badgeAlreadyExists'));
      return;
    }
    const updatedBadges = [...currentBadgeLabels, badgeLabelToAdd];
    updateBadgeLabels(updatedBadges);
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
              <p className="font-bold">{t(labelTranslationId)}</p>
            </FormLabel>
          )}
          <FormControl>
            <div className="flex flex-row flex-wrap gap-2">
              {badges?.map((badge) => (
                <BadgeSH
                  key={`badge-${badge}`}
                  className="color-white h-[36px]"
                >
                  {badge}
                  <button
                    type="button"
                    className="ml-2"
                    onClick={() => handleRemoveBadge(badges, badge, field.onChange)}
                  >
                    <MdRemoveCircleOutline className="h-[24px] w-[24px]" />
                  </button>
                </BadgeSH>
              ))}
              {!readOnly && (
                <InputWithActionIcons
                  className="h-[36px] w-[250px] rounded-md"
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
