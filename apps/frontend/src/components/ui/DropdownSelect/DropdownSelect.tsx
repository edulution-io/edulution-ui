/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === selectedVal) || null;
  const selectedLabel = selectedOption ? t(selectedOption.name) : '';

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
    return allOptions.filter((option) => t(option.name).toLowerCase().includes(q));
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
          const label = t(option.name);
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
