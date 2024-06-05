import { useNavigate, useSearchParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore.ts';
import Previews from '@/pages/FileSharing/previews/Previews.tsx';
import backgroundImage from '@/assets/background.jpg';
import { determinePreviewType } from '@/pages/FileSharing/previews/utilitys/utilitys.ts';
import { MdClose } from 'react-icons/md';

const EditFile = () => {
  const [searchParams] = useSearchParams();
  const { editableFiles, removeEditorFile, showEditor, setShowEditor } = useFileEditorStore();
  const [fileType, setFileType] = useState<string>('');
  const navigate = useNavigate();
  const navigateBack = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('editFile');
    navigate(url);
  };

  const removeItemFromEditMenu = (file: string) => {
    removeEditorFile(file);
  };

  useEffect(() => {
    setShowEditor(true);
  }, [searchParams]);

  const editFileParam = searchParams.get('editFile');
  const editableFile = editableFiles.find((file) => file.basename === editFileParam);

  useEffect(() => {
    if (editableFile) {
      setFileType(determinePreviewType(editableFile));
    }
  }, [editableFile]);

  const containerStyles =
    fileType === 'image'
      ? 'h-screen w-screen flex items-center justify-center bg-cover bg-center pt-8'
      : fileType === 'media'
        ? 'absolute inset-y-0 left-0 ml-0 mr-14 w-screen justify-center pr-14 pt-8'
        : 'absolute inset-y-0 left-0 ml-0 mr-14 w-screen justify-center pr-14 pt-8';

  return (
    <div
      className=" absolute inset-y-0 left-0 ml-0 mr-14 w-screen justify-center pr-14"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="fixed left-1/2 top-0 z-10 flex -translate-x-1/2 transform items-center space-x-4">
        <button
          type="button"
          className="rounded bg-red-500 px-4 text-white hover:bg-red-700"
          onClick={() => {
            editableFile != undefined && removeItemFromEditMenu(editableFile.filename);
            navigateBack();
          }}
        >
          <MdClose className="inline" /> {t('fileEditingPage.close')}
        </button>
      </div>
      <div className={containerStyles}>
        {editableFile && showEditor ? (
          <Previews
            type={'desktop'}
            file={editableFile}
            mode={'edit'}
            onClose={() => {
              removeItemFromEditMenu(editableFile.filename);
              navigateBack();
            }}
            isPreview={false}
          />
        ) : (
          <h1 className="text-white">{t('fileEditingPage.fileNotFound')}</h1>
        )}
      </div>
    </div>
  );
};

export default EditFile;
