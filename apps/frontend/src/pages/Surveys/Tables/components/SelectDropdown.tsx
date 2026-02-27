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

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@edulution-io/ui-kit';

export interface SelectOption {
  id: string;
  name: string;
}

export interface SelectDropdownProps {
  options: SelectOption[];
  initialValue: string;
  onSelect: (val: string) => void;
}

const SelectDropdown = ({ options, initialValue, onSelect }: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue);

  const selectedOption = options.find((o) => o.id === value);

  const handleSelect = (id: string) => {
    setValue(id);
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        className="w-full rounded-lg bg-accent px-4 py-2 text-start text-sm text-background hover:bg-accent"
        onClick={() => setIsOpen((prev) => !prev)}
        onBlur={() => setIsOpen(false)}
      >
        {selectedOption?.name ?? ''}
        <FontAwesomeIcon
          icon={isOpen ? faChevronUp : faChevronDown}
          className="h-2 w-2 p-1 pl-2 pr-0"
        />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-full overflow-y-auto rounded-lg bg-accent-light shadow-md">
          <div
            role="listbox"
            className="p-1"
          >
            {options.map((o) => (
              <div
                key={o.id}
                role="option"
                aria-selected={o.id === value}
                tabIndex={0}
                className={cn('cursor-pointer px-2.5 py-2 text-sm text-input hover:bg-accent', {
                  'font-bold': o.id === value,
                })}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(o.id);
                }}
              >
                {o.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
