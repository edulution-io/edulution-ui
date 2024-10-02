import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';
import cn from '@/lib/utils';
import { Textarea } from '../ui/Textarea';

type YamlEditorProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const validateYaml = (yamlValue: string) => {
    try {
      parse(yamlValue);
      setError(null);
    } catch (err) {
      setError(t('yamleditor.invalidYaml'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    validateYaml(newValue);
    onChange(e);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={t('yamleditor.placeholder')}
        className="h-max-[200px] h-[200px] overflow-y-auto bg-ciDarkGrey text-p text-ciLightGrey scrollbar-thin placeholder:text-p focus:outline-none"
      />
      <p className={cn('mt-2 text-ciLightRed', !error && 'invisible')}>{error}</p>
      {value !== '' ? (
        <pre className="mt-4 h-64 w-full overflow-auto overflow-y-auto rounded-md bg-ciDarkGrey p-4 text-ciLightGrey scrollbar-thin">
          {value}
        </pre>
      ) : null}
    </div>
  );
};

export default YamlEditor;
