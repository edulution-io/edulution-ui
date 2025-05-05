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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';
import cn from '@libs/common/utils/className';
import { Textarea } from '../ui/Textarea';

type YamlEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange, disabled = false, className }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const validateYaml = (yamlValue: string) => {
    try {
      parse(yamlValue);
      setError(null);
    } catch (err) {
      setError(t('settings.yamleditor.invalidYaml'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    validateYaml(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const tab = '  ';
      const newValue = value.substring(0, start) + tab + value.substring(end);

      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = start + tab.length;
        textarea.selectionEnd = start + tab.length;
      }, 0);

      validateYaml(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t('settings.yamleditor.placeholder')}
        style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12pt' }}
        className={cn(
          'overflow-y-auto bg-accent text-p text-secondary scrollbar-thin placeholder:text-p focus:outline-none',
          error ? 'border border-ciLightRed' : 'border border-accent',
          className,
        )}
        disabled={disabled}
      />
      {error && <p className="mt-2 text-ciLightRed">{error}</p>}
    </div>
  );
};

export default YamlEditor;
