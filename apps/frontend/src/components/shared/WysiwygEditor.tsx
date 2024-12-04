import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BULLETIN_EDITOR_FORMATS, BULLETIN_EDITOR_MODULES } from '@libs/bulletinBoard/constants/bulletinEditorConfig';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value, onChange }) => (
  <ReactQuill
    theme="snow"
    value={value}
    onChange={onChange}
    modules={BULLETIN_EDITOR_MODULES}
    formats={BULLETIN_EDITOR_FORMATS}
  />
);

export default WysiwygEditor;
