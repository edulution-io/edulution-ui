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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import cn from '@libs/common/utils/className';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import { Button } from '@/components/shared/Button';
import Input from '@/components/shared/Input';

interface TimeSelectorProps {
  value: number;
  values: number[];
  onChange: (value: number) => void;
  variant?: DropdownVariant;
  padStart?: boolean;
  label?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  values,
  onChange,
  variant = 'default',
  padStart = false,
  label,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const formatValue = (val: number): string => (padStart ? val.toString().padStart(2, '0') : val.toString());

  useEffect(() => {
    if (!isEditing) {
      requestAnimationFrame(() => {
        selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setEditValue(formatValue(value));
    setIsEditing(true);
  }, [value, padStart]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 2);
    setEditValue(newValue);
  }, []);

  const commitEdit = useCallback(() => {
    const numValue = parseInt(editValue, 10);
    if (!Number.isNaN(numValue)) {
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const clampedValue = Math.max(minVal, Math.min(maxVal, numValue));

      const step = values.length > 1 ? values[1] - values[0] : 1;
      if (step > 1) {
        const closestValue = values.reduce((prev, curr) =>
          Math.abs(curr - numValue) < Math.abs(prev - numValue) ? curr : prev,
        );
        onChange(closestValue);
      } else {
        onChange(clampedValue);
      }
    }
    setIsEditing(false);
    setEditValue('');
  }, [editValue, values, onChange]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitEdit();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setEditValue('');
      }
    },
    [commitEdit],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();

      const currentIndex = values.indexOf(value);
      if (currentIndex === -1) return;

      let newIndex: number;
      if (e.deltaY > 0) {
        newIndex = currentIndex < values.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : values.length - 1;
      }

      onChange(values[newIndex]);
    },
    [value, values, onChange],
  );

  const handleButtonKeyDown = useCallback(
    (e: React.KeyboardEvent, val: number) => {
      const currentIndex = values.indexOf(val);

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = currentIndex > 0 ? currentIndex - 1 : values.length - 1;
        onChange(values[newIndex]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = currentIndex < values.length - 1 ? currentIndex + 1 : 0;
        onChange(values[newIndex]);
      }
    },
    [values, onChange],
  );

  return (
    <div className="flex flex-col">
      <div
        className="flex h-12 flex-col items-center justify-center border-b border-gray-600 pt-2"
        onWheel={handleWheel}
      >
        {label && <span className="text-[10px] text-gray-400">{label}</span>}
        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={editValue}
            onChange={handleInputChange}
            onBlur={commitEdit}
            onKeyDown={handleInputKeyDown}
            className={cn(
              'w-10 rounded px-1 text-center text-lg font-medium outline-none',
              variant === 'default' && 'bg-primary text-primary-foreground',
              variant === 'dialog' && 'bg-ring text-white',
            )}
            maxLength={2}
          />
        ) : (
          <span
            className={cn(
              'cursor-pointer rounded px-2 text-lg font-medium transition-colors',
              variant === 'default' && 'hover:bg-accent',
              variant === 'dialog' && 'hover:bg-gray-700',
            )}
            onDoubleClick={handleDoubleClick}
            title="Doppelklick zum Bearbeiten"
          >
            {formatValue(value)}
          </span>
        )}
      </div>

      {/* Scrollable List */}
      <div
        ref={scrollRef}
        className="h-[200px] overflow-y-auto overscroll-contain sm:h-[260px]"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1 p-2">
          {values.map((val) => {
            const isSelected = value === val;
            return (
              <Button
                key={val}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                variant={isSelected ? 'btn-outline' : 'btn-small'}
                data-selected={isSelected}
                className={cn(
                  'aspect-square max-h-[32px] w-full shrink-0 text-sm font-medium',
                  variant === 'default' && !isSelected && 'bg-background text-foreground',
                  variant === 'dialog' && !isSelected && 'bg-muted text-secondary',
                  isSelected && 'ring-2 ring-primary',
                )}
                onClick={() => onChange(val)}
                onKeyDown={(e) => handleButtonKeyDown(e, val)}
              >
                {formatValue(val)}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeSelector;
