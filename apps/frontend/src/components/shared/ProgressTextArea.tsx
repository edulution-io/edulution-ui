import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '../ui/Textarea';

type ProgressTextAreaProps = {
  text: string[];
};

const ProgressTextArea: React.FC<ProgressTextAreaProps> = ({ text }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const progressText = text.join('\n');

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className="flex flex-col items-center p-4">
      <Textarea
        ref={textAreaRef}
        value={progressText}
        readOnly
        placeholder={t('common.progress')}
        className="w-full overflow-y-auto whitespace-pre-wrap rounded-md border bg-foreground p-2 text-p text-background scrollbar-thin placeholder:text-p focus:outline-none"
      />
    </div>
  );
};

export default ProgressTextArea;
