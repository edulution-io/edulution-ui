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
