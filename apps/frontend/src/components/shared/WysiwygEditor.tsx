import React, { useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/node_modules/quill/dist/quill.snow.css';
import BULLETIN_EDITOR_FORMATS from '@libs/bulletinBoard/constants/bulletinEditorFormats';
import useUserStore from '@/store/UserStore/UserStore';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value = '', onChange, onUpload }) => {
  const { eduApiToken } = useUserStore();

  const quillRef = useRef<ReactQuill | null>(null);

  const modules = React.useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              console.log(`file ${JSON.stringify(file, null, 2)}`);
              if (file) {
                try {
                  const uploadedFilename = await onUpload(file);
                  console.log(`uploadedFilename ${JSON.stringify('uploadedFilename', null, 2)}`);
                  const fetchImageUrl = `${EDU_API_ROOT}/${uploadedFilename}?token=${eduApiToken}`;

                  console.log(`secureUrl ${JSON.stringify(fetchImageUrl, null, 2)}`);
                  const quillInstance = quillRef.current?.getEditor();
                  if (quillInstance) {
                    const range = quillInstance.getSelection();
                    quillInstance.insertEmbed(range?.index || 0, 'image', fetchImageUrl);
                  } else {
                    console.error('Quill instance is unavailable');
                  }
                } catch (error) {
                  console.error('Failed to upload or fetch attachment:', error);
                }
              }
            };
          },
        },
      },
    }),
    [],
  );

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={BULLETIN_EDITOR_FORMATS}
    />
  );
};

export default WysiwygEditor;
