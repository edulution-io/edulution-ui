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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import { INPUT_BASE_CLASSES, VARIANT_COLORS } from '@libs/ui/constants/commonClassNames';

const DROPDOWN_SELECT_CLASSES = `${INPUT_BASE_CLASSES} box-border pl-2.5 pr-[52px] text-start placeholder:text-background`;

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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setMenuPosition({
        top: openToTop ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, openToTop]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(target);

      if (isOutsideDropdown && isOutsideMenu) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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

  const arrowPointsDown = (isOpen && !openToTop) || (!isOpen && openToTop);

  const variantClasses = {
    default: VARIANT_COLORS.default,
    dialog: VARIANT_COLORS.dialog,
  };

  const optionVariantClasses = {
    default: {
      base: 'hover:bg-muted',
      selected: 'bg-muted',
    },
    dialog: {
      base: 'hover:bg-muted-light',
      selected: 'bg-muted-light',
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
        className={cn(DROPDOWN_SELECT_CLASSES, variantClasses[variant], {
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

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={cn(
              'fixed z-[1000] mt-1 box-border max-h-[125px] overflow-y-auto rounded-lg text-p scrollbar-thin',
              variantClasses[variant],
            )}
            style={{
              top: openToTop ? 'auto' : menuPosition.top,
              bottom: openToTop ? window.innerHeight - menuPosition.top : 'auto',
              left: menuPosition.left,
              width: menuPosition.width,
            }}
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
          </div>,
          document.body,
        )}
    </div>
  );
};

export default DropdownSelect;
