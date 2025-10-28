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
