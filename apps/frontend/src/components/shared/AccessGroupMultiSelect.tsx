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
import MultipleSelectorSH from '@/components/ui/MultipleSelectorSH';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

interface AccessGroupMultiSelectProps {
  value?: MultipleSelectorGroup[];
  options: MultipleSelectorGroup[];
  onChange: (groups: MultipleSelectorGroup[]) => void;
  disabled?: boolean;
  placeholder?: string;
  variant?: 'default' | 'dialog';
}

const AccessGroupMultiSelect: React.FC<AccessGroupMultiSelectProps> = ({
  value,
  options,
  onChange,
  disabled,
  placeholder,
  variant = 'default',
}) => {
  const { t } = useTranslation();

  const emptyIndicator = (
    <p className={`leading-1 w-full py-2 text-center ${variant === 'default' ? 'dark:text-secondary' : ''}`}>
      {t('search.no-results')}
    </p>
  );

  const handleChange = (selected: MultipleSelectorOptionSH[]) => {
    onChange(selected as MultipleSelectorGroup[]);
  };

  return (
    <MultipleSelectorSH
      value={value}
      options={options}
      disabled={disabled}
      placeholder={placeholder || t('search.type-to-search')}
      emptyIndicator={emptyIndicator}
      badgeClassName="font-normal "
      onChange={handleChange}
      inputProps={{ className: 'm-0' }}
      variant={variant}
    />
  );
};

export default AccessGroupMultiSelect;
