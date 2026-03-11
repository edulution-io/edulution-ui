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

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import DropdownOption from '@libs/ui/types/dropdownOption';
import { cn, INPUT_BASE_CLASSES, VARIANT_COLORS } from '@edulution-io/ui-kit';
import DropdownSelectPanel from '@/components/ui/DropdownSelect/DropdownSelectPanel';

const DROPDOWN_SELECT_CLASSES = `${INPUT_BASE_CLASSES} box-border pl-2.5 pr-8 text-start placeholder:text-background`;

interface DropdownProps {
  options: DropdownOption[];
  selectedVal: string;
  handleChange: (value: string) => void;
  openToTop?: boolean;
  classname?: string;
  inputClassName?: string;
  menuClassName?: string;
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
  inputClassName,
  menuClassName,
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
  const listboxId = useId();

  const closeMenu = () => setIsOpen(false);

  const calculatePosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();

    if (!enablePortalUsage) {
      setMenuPosition({ top: 0, left: 0, width: rect.width });
      return;
    }

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

  const onSelect = useCallback(
    (id: string) => {
      setQuery('');
      handleChange(id);
      closeMenu();
    },
    [handleChange, closeMenu],
  );

  const panelStyle: React.CSSProperties = enablePortalUsage
    ? { maxHeight: MENU_MAX_HEIGHT, top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }
    : { maxHeight: MENU_MAX_HEIGHT, width: Math.max(menuPosition.width, 150) };

  const panel = (
    <DropdownSelectPanel
      menuRef={menuRef}
      options={filteredOptions}
      selectedVal={selectedVal}
      onSelect={onSelect}
      translateLabel={translateLabel}
      variant={variant}
      style={panelStyle}
      listboxId={listboxId}
      menuClassName={menuClassName}
      enablePortalUsage={enablePortalUsage}
    />
  );

  const DropdownPanel = enablePortalUsage ? createPortal(panel, document.body) : panel;

  return (
    <div
      className={cn('relative cursor-default', classname)}
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={listboxId}
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
        className={cn(
          DROPDOWN_SELECT_CLASSES,
          VARIANT_COLORS[variant],
          {
            'cursor-text': searchEnabled,
            'cursor-pointer': !searchEnabled,
          },
          inputClassName,
        )}
        aria-autocomplete={searchEnabled ? 'list' : undefined}
        aria-controls={listboxId}
      />

      <div
        className={cn(
          'pointer-events-none absolute right-2.5 top-1/2 block h-0 w-0 -translate-y-1/2 border-solid border-border',
          {
            'border-x-[5px] border-b-0 border-t-[5px] border-x-transparent': !arrowPointsDown,
            'border-x-[5px] border-b-[5px] border-t-0 border-x-transparent': arrowPointsDown,
          },
        )}
      />

      {isOpen && DropdownPanel}
    </div>
  );
};

export default DropdownSelect;
