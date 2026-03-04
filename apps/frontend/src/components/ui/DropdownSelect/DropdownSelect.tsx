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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@edulution-io/ui-kit';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import { INPUT_BASE_CLASSES, VARIANT_COLORS } from '@libs/ui/constants/commonClassNames';
import DropdownSelectPanel from '@/components/ui/DropdownSelect/DropdownSelectPanel';

const DROPDOWN_SELECT_CLASSES = `${INPUT_BASE_CLASSES} box-border pl-2.5 pr-8 text-start placeholder:text-background`;

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
  enableSearch?: boolean;
  enablePortalUsage?: boolean;
}

const MENU_MAX_HEIGHT = 125;
const MENU_MARGIN = 8;

const DropdownSelect = ({
  options,
  selectedVal,
  handleChange,
  openToTop: openToTopProp = false,
  classname,
  variant = 'default',
  placeholder = '',
  translate = true,
  enableSearch = true,
  enablePortalUsage = true,
}: DropdownProps) => {
  const { t } = useTranslation();
  const searchEnabled = enableSearch && options.length > 3;
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [openToTop, setOpenToTop] = useState(openToTopProp);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);

  const calculatePosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenToTop = openToTopProp || (spaceBelow < MENU_MAX_HEIGHT + MENU_MARGIN && spaceAbove > spaceBelow);
    const menuHeight = Math.min(menuRef.current?.scrollHeight ?? MENU_MAX_HEIGHT, MENU_MAX_HEIGHT);

    const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
    const calculatedTop = shouldOpenToTop
      ? rect.top - menuHeight - MENU_MARGIN + viewportOffsetTop
      : rect.bottom + MENU_MARGIN + viewportOffsetTop;

    setOpenToTop(shouldOpenToTop);
    setMenuPosition({
      top: calculatedTop,
      left: rect.left,
      width: rect.width,
    });
  }, [openToTopProp]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let requestAnimationFrameId: number;

    const updatePosition = () => {
      calculatePosition();
      requestAnimationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      cancelAnimationFrame(requestAnimationFrameId);
    };
  }, [isOpen, calculatePosition]);

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

  const arrowPointsDown = (isOpen && !openToTop) || (!isOpen && openToTop);

  const variantClasses = {
    default: VARIANT_COLORS.default,
    dialog: VARIANT_COLORS.dialog,
  };

  const DropdownPanel = !enablePortalUsage ? (
    <DropdownSelectPanel
      menuRef={menuRef}
      options={filteredOptions}
      selectedVal={selectedVal}
      handleChange={handleChange}
      translateLabel={translateLabel}
      setQuery={setQuery}
      closeMenu={closeMenu}
      variantClasses={variantClasses}
      variant={variant}
      maxHeight={MENU_MAX_HEIGHT}
      menuPosition={menuPosition}
      enablePortalUsage={enablePortalUsage}
    />
  ) : (
    createPortal(
      <DropdownSelectPanel
        menuRef={menuRef}
        options={filteredOptions}
        selectedVal={selectedVal}
        handleChange={handleChange}
        translateLabel={translateLabel}
        setQuery={setQuery}
        closeMenu={closeMenu}
        variantClasses={variantClasses}
        variant={variant}
        maxHeight={MENU_MAX_HEIGHT}
        menuPosition={menuPosition}
        enablePortalUsage={enablePortalUsage}
      />,
      document.body,
    )
  );

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

      {isOpen && DropdownPanel}
    </div>
  );
};

export default DropdownSelect;
