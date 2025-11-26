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

import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';
import cn from '@libs/common/utils/className';
import DropdownVariant from '@libs/ui/types/DropdownVariant';

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
  placeholder?: string;
  translate?: boolean;
}

const DropdownSelect = ({
  options,
  selectedVal,
  handleChange,
  openToTop = false,
  classname,
  variant = 'default',
  placeholder = '',
  translate = true,
}: DropdownProps) => {
  const { t } = useTranslation();
  const searchEnabled = options.length > 3;
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const translateLabel = (label: string) => (translate ? t(label) : label);

  const selectedOption = options.find((o) => o.id === selectedVal);
  const selectedLabel = selectedOption ? translateLabel(selectedOption.name) : '';

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((option) => translateLabel(option.name).toLowerCase().includes(q));
  }, [options, query, translate]);

  const openMenu = () => {
    setIsOpen(true);
    if (searchEnabled) setQuery('');
  };

  const closeMenu = () => setIsOpen(false);

  const selectOption = (option: DropdownOptions) => {
    setQuery('');
    handleChange(option.id);
    closeMenu();
  };

  const handleKeyDown = (e: React.KeyboardEvent, option: DropdownOptions) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectOption(option);
    }
  };

  useOnClickOutside(dropdownRef, closeMenu);

  const arrowPointsDown = (isOpen && !openToTop) || (!isOpen && openToTop);

  const inputBaseClasses =
    'box-border w-full rounded-lg py-2 pl-2.5 pr-[52px] text-start text-base leading-6 text-secondary outline-none transition-all duration-200';

  const variantClasses = {
    default: 'bg-accent',
    dialog: 'bg-muted',
  };

  const optionVariantClasses = {
    default: {
      base: 'text-secondary hover:bg-muted',
      selected: 'bg-muted text-secondary',
    },
    dialog: {
      base: 'text-secondary hover:bg-muted-light',
      selected: 'bg-muted-light text-secondary',
    },
  };

  return (
    <div
      className={cn('relative cursor-default', classname)}
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="dropdown-listbox"
    >
      <input
        type={searchEnabled ? 'text' : 'button'}
        name={searchEnabled ? 'searchTerm' : undefined}
        value={searchEnabled ? query : selectedLabel || t(placeholder)}
        placeholder={searchEnabled ? selectedLabel || t(placeholder) : undefined}
        onChange={searchEnabled ? (e) => setQuery(e.target.value) : undefined}
        onClick={openMenu}
        onFocus={searchEnabled ? openMenu : undefined}
        readOnly={!searchEnabled}
        disabled={options.length === 0}
        className={cn(inputBaseClasses, variantClasses[variant], {
          'cursor-text': searchEnabled,
          'cursor-pointer': !searchEnabled,
        })}
        aria-autocomplete={searchEnabled ? 'list' : undefined}
        aria-controls="dropdown-listbox"
      />

      <div
        className={cn('absolute right-2.5 top-3.5 mt-1.5 block h-0 w-0 border-solid border-border', {
          'border-x-[5px] border-b-0 border-t-[5px] border-x-transparent': !arrowPointsDown,
          'border-x-[5px] border-b-[5px] border-t-0 border-x-transparent': arrowPointsDown,
        })}
      />

      {isOpen && (
        <div
          className={cn(
            'absolute z-[1000] -mt-px box-border max-h-[125px] w-full overflow-y-auto text-secondary shadow-xl scrollbar-thin',
            variantClasses[variant],
            {
              'top-full': !openToTop,
              'bottom-full -mb-px': openToTop,
            },
          )}
          role="listbox"
          id="dropdown-listbox"
        >
          {filteredOptions.map((option) => {
            const label = translateLabel(option.name);
            const selected = option.id === selectedVal;
            const classes = optionVariantClasses[variant];

            return (
              <div
                key={option.id}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onClick={() => selectOption(option)}
                onKeyDown={(e) => handleKeyDown(e, option)}
                className={cn(
                  'box-border block cursor-pointer px-2.5 py-2',
                  selected ? classes.selected : classes.base,
                )}
                title={label}
              >
                {label}
              </div>
            );
          })}
          {filteredOptions.length === 0 && (
            <div
              className="box-border block cursor-default px-2.5 py-2"
              aria-disabled="true"
            >
              {t('search.no-results')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
