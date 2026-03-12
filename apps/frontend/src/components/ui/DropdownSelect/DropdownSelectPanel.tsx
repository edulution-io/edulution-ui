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

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import DropdownOption from '@libs/ui/types/dropdownOption';
import { cn, VARIANT_COLORS } from '@edulution-io/ui-kit';

interface DropdownSelectPanelProps {
  menuRef: React.RefObject<HTMLDivElement>;
  options: DropdownOption[];
  selectedVal: string;
  onSelect: (id: string) => void;
  translateLabel: (label: string) => string;
  variant: DropdownVariant;
  style: React.CSSProperties;
  listboxId: string;
  menuClassName?: string;
  enablePortalUsage?: boolean;
}

const DropdownSelectPanel = ({
  menuRef,
  options,
  selectedVal,
  onSelect,
  translateLabel,
  variant,
  style,
  listboxId,
  menuClassName,
  enablePortalUsage = true,
}: DropdownSelectPanelProps) => {
  const { t } = useTranslation();

  const handleKeyDown = (e: React.KeyboardEvent, optionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(optionId);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.currentTarget.scrollTop += e.deltaY;
  };

  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const deltaY = touchStartY.current - e.touches[0].clientY;
    e.currentTarget.scrollTop += deltaY;
    touchStartY.current = e.touches[0].clientY;
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
      ref={menuRef}
      className={cn(
        {
          'pointer-events-auto fixed z-[1000] mt-1 box-border overflow-y-auto rounded-lg text-p scrollbar-thin':
            enablePortalUsage,
        },
        {
          'absolute z-10 mt-1 box-border overflow-y-auto rounded-lg text-p scrollbar-thin': !enablePortalUsage,
        },
        VARIANT_COLORS[variant],
        menuClassName,
      )}
      style={style}
      role="listbox"
      id={listboxId}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {options.map((option) => {
        const label = translateLabel(option.name);
        const selected = option.id === selectedVal;
        const classes = optionVariantClasses[variant];

        return (
          <div
            key={option.id}
            role="option"
            aria-selected={selected}
            title={label}
            aria-disabled={option.disabled || undefined}
            tabIndex={option.disabled ? -1 : 0}
            onClick={option.disabled ? undefined : () => onSelect(option.id)}
            onKeyDown={option.disabled ? undefined : (e) => handleKeyDown(e, option.id)}
            className={cn(
              'box-border block px-2.5 py-2',
              option.disabled
                ? 'cursor-not-allowed opacity-50'
                : cn('cursor-pointer', selected ? classes.selected : classes.base),
            )}
          >
            {label}
          </div>
        );
      })}
      {options.length === 0 && (
        <div
          className="box-border block cursor-default px-2.5 py-2"
          aria-disabled="true"
        >
          {t('search.no-results')}
        </div>
      )}
    </div>
  );
};

export default DropdownSelectPanel;
