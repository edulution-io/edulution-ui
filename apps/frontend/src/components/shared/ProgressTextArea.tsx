import React, { useEffect, useRef } from 'react';
import { Textarea } from '../ui/Textarea';

type ProgressTextAreaProps = {
  text: string[];
};

const ProgressTextArea: React.FC<ProgressTextAreaProps> = ({ text }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
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
        placeholder="Docker Progress wird hier angezeigt..."
        style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '12pt',
          width: '100%',
          height: '300px',
          overflowY: 'auto',
          backgroundColor: '#2d2d2d',
          color: '#f5f5f5',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #444',
        }}
        className="scrollbar-thin"
      />
    </div>
  );
};

export default ProgressTextArea;
