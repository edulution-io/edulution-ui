import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/node_modules/quill/dist/quill.snow.css';
import BULLETIN_EDITOR_FORMATS from '@libs/bulletinBoard/constants/bulletinEditorFormats';
import useUserStore from '@/store/UserStore/UserStore';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import BULLETIN_BOARD_ALLOWED_MIME_TYPES from '@libs/bulletinBoard/constants/allowedMimeTypes';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value = '', onChange, onUpload }) => {
  const { eduApiToken } = useUserStore();
  const { t } = useTranslation();

  const quillRef = useRef<ReactQuill | null>(null);

  const handleImage = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', BULLETIN_BOARD_ALLOWED_MIME_TYPES.join(', '));
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const uploadedFilename = await onUpload(file);
          const fetchImageUrl = `${EDU_API_ROOT}/${uploadedFilename}?token=${eduApiToken}`;

          const quillInstance = quillRef.current?.getEditor();
          if (quillInstance) {
            const range = quillInstance.getSelection();
            quillInstance.insertEmbed(range?.index || 0, 'image', fetchImageUrl);
          }
        } catch (error) {
          console.error('Failed to upload or fetch attachment:', error);
          toast.error(t('errors.uploadOrFetchAttachmentFailed'));
        }
      }
    };
  };

  const modules = useMemo(
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
          image: handleImage,
        },
      },
    }),
    [],
  );

  return (
    <div className="quill-container">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={BULLETIN_EDITOR_FORMATS}
      />
    </div>
  );
};

export default WysiwygEditor;
