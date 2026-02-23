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
import { Control, FieldValues, Path, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '@edulution-io/ui-kit';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { FormControl, FormDescription, FormFieldSH, FormItem } from '@/components/ui/Form';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import useGroupStore from '@/store/GroupStore';

interface AppConfigGroupSelectProps<T extends FieldValues> {
  fieldPath: Path<T>;
  linkedToFieldPath: Path<T>;
  control: Control<T>;
  option: {
    title?: string;
    description: string;
  };
}

const AppConfigGroupSelect = <T extends FieldValues>({
  fieldPath,
  linkedToFieldPath,
  control,
  option,
}: AppConfigGroupSelectProps<T>) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();

  const isEnabled = useWatch({ control, name: linkedToFieldPath });

  return (
    <div
      className={cn(
        'transition-[max-height,opacity,overflow] duration-300 ease-in-out',
        isEnabled ? 'max-h-96 opacity-100' : 'max-h-0 overflow-hidden opacity-0',
      )}
    >
      <FormFieldSH
        control={control}
        name={fieldPath}
        render={({ field }) => (
          <FormItem>
            {option.title && <p className="font-bold">{t(option.title)}</p>}
            <FormControl>
              <AsyncMultiSelect<MultipleSelectorGroup>
                value={(field.value as MultipleSelectorGroup[]) || []}
                onSearch={searchGroups}
                onChange={(selected) => field.onChange(selected)}
                placeholder={t('search.type-to-search')}
              />
            </FormControl>
            {option.description && <FormDescription>{t(option.description)}</FormDescription>}
          </FormItem>
        )}
      />
    </div>
  );
};

export default AppConfigGroupSelect;
