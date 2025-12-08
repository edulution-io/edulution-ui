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

import React, { useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/node_modules/quill/dist/quill.snow.css';
import './WysiwygEditor.css';
import BULLETIN_EDITOR_FORMATS from '@libs/bulletinBoard/constants/bulletinEditorFormats';
import useUserStore from '@/store/UserStore/useUserStore';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value = '', onChange, onUpload }) => {
  const { eduApiToken } = useUserStore();
  const { t } = useTranslation();

  const quillRef = useRef<ReactQuill | null>(null);

  const handleFormatChange = (format: 'color' | 'background') => (colorValue: string) => {
    if (colorValue) {
      toast.warning(t('warnings.colorMayConflictWithTheme'));
    }

    const quill = quillRef.current?.getEditor();

    if (quill) {
      quill.format(format, colorValue);
    }
  };

  const uploadImage = async (file: File, index?: number) => {
    if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(`${t('common.errors.invalidFileType')}: ${file.type}`);
      return;
    }

    try {
      const uploadedFilename = await onUpload(file);
      const fetchImageUrl = `/${EDU_API_ROOT}/${uploadedFilename}?token=${eduApiToken}`;

      const quillInstance = quillRef.current?.getEditor();
      if (quillInstance) {
        const range = quillInstance.getSelection();
        quillInstance.insertEmbed(index ?? range?.index ?? 0, 'image', fetchImageUrl);
      }
    } catch (error) {
      console.error('Failed to upload or fetch attachment:', error);
      toast.error(t('errors.uploadOrFetchAttachmentFailed'));
    }
  };

  const handleImage = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', IMAGE_UPLOAD_ALLOWED_MIME_TYPES.join(', '));
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        await uploadImage(file);
      }
    };
  };

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return undefined;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((file) => IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type));

      if (imageFiles.length === 0) return;

      const range = quill.getSelection(true);
      const index = range?.index ?? 0;

      imageFiles.forEach((file, i) => {
        void uploadImage(file, index + i);
      });
    };

    const editorElement = quill.root;
    editorElement.addEventListener('drop', handleDrop, true);

    return () => {
      editorElement.removeEventListener('drop', handleDrop, true);
    };
  }, [eduApiToken, onUpload, t, uploadImage]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
        handlers: {
          image: handleImage,
          color: handleFormatChange('color'),
          background: handleFormatChange('background'),
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
