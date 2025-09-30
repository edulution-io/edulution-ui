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
  translate?: boolean;
}

const DropdownSelect: React.FC<DropdownProps> = ({
  options,
  selectedVal,
  handleChange,
  openToTop = false,
  classname,
  variant = 'default',
  searchEnabled = false,
  placeholder = '',
  translate = true,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  useOnClickOutside(dropdownRef, handleClickOutside);

  const selectOption = (option: DropdownOptions) => {
    setQuery(() => '');
    handleChange(option.id);
    setIsOpen((prevVal) => !prevVal);
  };

  const getDisplayValue = (): string => {
    if (query) return query;
    if (selectedVal) return options.find((option) => option.id === selectedVal)?.name || '';
    if (placeholder) return t(placeholder);
    return '';
  };

  const getSearchValue = (opts: DropdownOptions[]): DropdownOptions[] =>
    opts.filter((option) => {
      const optionName = translate ? t(option.name) : option.name;
      return optionName.toLowerCase().indexOf(query.toLowerCase()) > -1;
    });

  return (
    <div
      className={cn(styles.dropdown, classname, {
        [styles.default]: variant === 'default',
        [styles.dialog]: variant === 'dialog',
      })}
      ref={dropdownRef}
    >
      <div className={styles['selected-value']}>
        <input
          type={searchEnabled ? 'text' : 'button'}
          value={getDisplayValue()}
          name="searchTerm"
          onChange={(e) => {
            if (searchEnabled) {
              setQuery(e.target.value);
              handleChange('');
            }
          }}
          onClickCapture={() => setIsOpen((prevVal) => !prevVal)}
          disabled={options.length === 0}
          className={cn('text-start', {
            'bg-background text-foreground': variant === 'default',
            'bg-muted text-secondary': variant === 'dialog',
          })}
        />
      </div>
      <div className={cn(styles.arrow, { [styles.open]: isOpen, [styles.up]: openToTop })} />
      <div
        className={cn('shadow-xl scrollbar-thin', styles.options, {
          [styles.open]: isOpen,
          [styles.up]: openToTop,
          'bg-background text-foreground': variant === 'default',
          'bg-muted text-secondary': variant === 'dialog',
        })}
      >
        {getSearchValue(options).map((option) => (
          <div
            key={option.id}
            onClickCapture={() => selectOption(option)}
            className={cn(styles.option, {
              [styles.selected]: option.id === selectedVal,
              'hover:bg-accent-light': variant === 'default',
              'bg-muted hover:bg-secondary': variant === 'dialog',
            })}
          >
            {translate ? t(option.name) : option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownSelect;
