import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';
import cn from '@/lib/utils';
import { Textarea } from '../ui/Textarea';

type YamlEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange }) => {
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
          'overflow-y-auto bg-ciDarkGrey text-p text-ciLightGrey scrollbar-thin placeholder:text-p focus:outline-none',
          error ? 'border border-ciLightRed' : 'border border-ciDarkGrey',
        )}
      />
      {error && <p className="mt-2 text-ciLightRed">{error}</p>}
    </div>
  );
};

export default YamlEditor;
