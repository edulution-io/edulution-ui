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

import React from 'react';
import Label from '@/components/ui/Label';
import Input from '@/components/shared/Input';

type ThemeColorPickerProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
};

const ThemeColorPicker = ({ label, value, onChange, description }: ThemeColorPickerProps) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newValue) || newValue === '') {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{label}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-16 cursor-pointer rounded border-2 border-border"
        />
        <Input
          type="text"
          variant="default"
          value={value}
          onChange={handleTextChange}
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
};

export default ThemeColorPicker;
