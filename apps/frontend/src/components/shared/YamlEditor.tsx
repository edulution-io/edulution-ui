import React from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '../ui/Textarea';

type YamlEditorProps = {
  value: string;
  onChange: () => void;
};

const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center p-4">
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={t('yamleditor.placeholder')}
        className="h-max-[200px] h-[200px] overflow-y-auto bg-ciDarkGrey text-p text-ciLightGrey scrollbar-thin placeholder:text-p focus:outline-none"
      />
      <pre className="mt-4 h-64 w-full overflow-auto overflow-y-auto rounded-md bg-ciDarkGrey p-4 text-ciLightGrey scrollbar-thin">
        {value}
      </pre>
    </div>
  );
};

export default YamlEditor;
