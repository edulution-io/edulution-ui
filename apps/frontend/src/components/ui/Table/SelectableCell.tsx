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

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { Row } from '@tanstack/react-table';
import { cn } from '@edulution-io/ui-kit';

interface SelectableCellProps<TData> {
  row?: Row<TData>;
  onClick?: () => void;
  className?: string;
  isFirstColumn?: boolean;
  text?: string | JSX.Element;
  textOnHover?: string;
  icon?: React.ReactElement;
  children?: React.ReactNode;
}

const SelectableCellInner = <TData,>(
  { row, onClick, className, isFirstColumn = false, text, textOnHover, icon, children }: SelectableCellProps<TData>,
  ref: React.Ref<HTMLDivElement>,
) => {
  const [isHovered, setIsHovered] = useState(false);
  const isChecked = row?.getIsSelected();
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const [checkboxWidth, setCheckboxWidth] = useState(0);

  const canSelect = row?.getCanSelect?.() ?? true;
  const isTextMode = text !== undefined || icon !== undefined || textOnHover !== undefined;
  const needsHoverHandlers = isTextMode && textOnHover;

  useEffect(() => {
    if (checkboxRef.current) {
      const width = checkboxRef.current.offsetWidth;
      setCheckboxWidth(width);
    }
  }, []);

  const renderContent = () => {
    if (isTextMode) {
      return (
        <>
          {icon ? <div className="mb-3 ml-2 mr-2 mt-3 flex items-center justify-center">{icon}</div> : null}
          <span
            className="text-md truncate font-medium"
            style={{
              marginLeft: isFirstColumn && !row ? `${checkboxWidth + 30}px` : undefined,
            }}
            aria-disabled={!canSelect}
          >
            {isHovered && textOnHover ? textOnHover : text}
          </span>
        </>
      );
    }

    return (
      <span
        className="text-md truncate font-medium"
        style={{
          marginLeft: isFirstColumn && !row ? `${checkboxWidth + 30}px` : undefined,
        }}
      >
        {children}
      </span>
    );
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      onKeyDown={onClick}
      tabIndex={0}
      role="button"
      className={cn(
        `flex min-w-4 items-center justify-start overflow-hidden ${isFirstColumn ? 'space-x-2' : ''} py-0`,
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      onMouseEnter={needsHoverHandlers ? () => setIsHovered(true) : undefined}
      onMouseLeave={needsHoverHandlers ? () => setIsHovered(false) : undefined}
    >
      {row ? (
        <Checkbox
          ref={checkboxRef}
          disabled={!canSelect}
          checked={isChecked}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => {
            if (canSelect) row.toggleSelected(!!checked);
          }}
          aria-label="Select row"
        />
      ) : (
        <div className="my-5" />
      )}
      {renderContent()}
    </div>
  );
};

const SelectableCell = forwardRef(SelectableCellInner) as <TData>(
  props: SelectableCellProps<TData> & React.RefAttributes<HTMLDivElement>,
) => JSX.Element;

export default SelectableCell;
