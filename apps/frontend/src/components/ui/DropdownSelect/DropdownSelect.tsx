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
import { DropdownVariant } from '@libs/ui/types/DropdownVariant';
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
}

const DropdownSelect: React.FC<DropdownProps> = ({
  options,
  selectedVal,
  handleChange,
  openToTop = false,
  classname,
  variant = 'default',
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
    handleChange(option.name);
    setIsOpen((prevVal) => !prevVal);
  };

  const getDisplayValue = (): string => {
    if (query) return query;
    if (selectedVal) return selectedVal;

    return '';
  };

  const filter = (opts: DropdownOptions[]): DropdownOptions[] =>
    opts.filter((option) => {
      const optionName = t(option.name);
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
      <div>
        <div className={styles['selected-value']}>
          <input
            type="text"
            value={getDisplayValue()}
            name="searchTerm"
            onChange={(e) => {
              setQuery(e.target.value);
              handleChange('');
            }}
            onClickCapture={() => setIsOpen((prevVal) => !prevVal)}
            disabled={options.length === 0}
            className={cn({
              'bg-background text-foreground': variant === 'default',
              'bg-muted text-secondary': variant === 'dialog',
            })}
          />
        </div>
      </div>
      <div className={cn(styles.arrow, { [styles.open]: isOpen, [styles.up]: openToTop })} />
      <div
        className={cn('scrollbar-thin', styles.options, {
          [styles.open]: isOpen,
          [styles.up]: openToTop,
          'bg-background text-foreground': variant === 'default',
          'bg-muted text-secondary': variant === 'dialog',
        })}
      >
        {filter(options).map((option) => (
          <div
            key={option.id}
            onClickCapture={() => selectOption(option)}
            className={cn(styles.option, {
              [styles.selected]: t(option.name) === selectedVal,
              'hover:bg-gray-200': variant === 'default',
              'bg-muted hover:bg-secondary': variant === 'dialog',
            })}
          >
            {t(option.name)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownSelect;
