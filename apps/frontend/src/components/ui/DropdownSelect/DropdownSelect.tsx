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

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';
import cn from '@libs/common/utils/className';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import styles from './dropdownselect.module.scss';

export type DropdownOptions = {
  id: string;
  name: string;
};

interface DropdownProps {
  options: DropdownOptions[];
  selectedVal: string;
  handleChange: (value: string) => void;
  openToTop?: boolean;
  classname?: string;
  variant?: DropdownVariant;
  searchEnabled?: boolean;
  placeholder?: string;
  translate?: boolean;
}

const DropdownSelect: React.FC<DropdownProps> = ({
  options,
  selectedVal,
  handleChange,
  openToTop = false,
  classname,
  variant = 'default',
  searchEnabled = true,
  placeholder = '',
  translate = true,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const translateLabel = (label: string) => (translate ? t(label) : label);

  const selectedOption = options.find((o) => o.id === selectedVal) || null;
  const selectedLabel = selectedOption ? translateLabel(selectedOption.name) : '';

  const openMenu = () => {
    setIsOpen(true);
    if (searchEnabled) setQuery('');
  };

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const selectOption = (option: DropdownOptions) => {
    setQuery('');
    handleChange(option.id);
    setIsOpen(false);
  };

  const filteredOptions = (allOptions: DropdownOptions[]): DropdownOptions[] => {
    if (!query) return allOptions;
    const q = query.toLowerCase();
    return allOptions.filter((option) => translateLabel(option.name).toLowerCase().includes(q));
  };

  return (
    <div
      className={cn(styles.dropdown, classname, {
        [styles.default]: variant === 'default',
        [styles.dialog]: variant === 'dialog',
      })}
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="dropdown-listbox"
    >
      <div className={styles['selected-value']}>
        {searchEnabled ? (
          <input
            type="text"
            name="searchTerm"
            value={query}
            placeholder={selectedLabel || t(placeholder)}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onClick={openMenu}
            onFocus={openMenu}
            disabled={options.length === 0}
            className={cn('text-start', {
              'bg-background text-foreground': variant === 'default',
              'bg-muted text-secondary': variant === 'dialog',
            })}
            aria-autocomplete="list"
            aria-controls="dropdown-listbox"
          />
        ) : (
          <input
            type="button"
            value={selectedLabel || t(placeholder)}
            onClick={openMenu}
            readOnly
            disabled={options.length === 0}
            className={cn('text-start', {
              'bg-background text-foreground': variant === 'default',
              'bg-muted text-secondary': variant === 'dialog',
            })}
          />
        )}
      </div>

      <div className={cn(styles.arrow, { [styles.open]: isOpen, [styles.up]: openToTop })} />

      <div
        className={cn('shadow-xl scrollbar-thin', styles.options, {
          [styles.open]: isOpen,
          [styles.up]: openToTop,
          'bg-background text-foreground': variant === 'default',
          'bg-muted text-secondary': variant === 'dialog',
        })}
        role="listbox"
        id="dropdown-listbox"
      >
        {filteredOptions(options).map((option) => {
          const label = translateLabel(option.name);
          const selected = option.id === selectedVal;
          return (
            <div
              key={option.id}
              role="option"
              aria-selected={selected}
              tabIndex={0}
              onClick={() => selectOption(option)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectOption(option);
                }
              }}
              className={cn(styles.option, {
                [styles.selected]: selected,
                'hover:bg-accent-light': variant === 'default',
                'bg-muted hover:bg-secondary': variant === 'dialog',
              })}
              title={label}
            >
              {label}
            </div>
          );
        })}
        {filteredOptions(options).length === 0 && (
          <div
            className={styles.option}
            aria-disabled="true"
          >
            {t('search.no-results')}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSelect;
