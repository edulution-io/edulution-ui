import { MdMinimize, MdOutlineOpenInFull } from 'react-icons/md';
import React, { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DirectoryFile } from '@/datatypes/filesystem.ts';

interface OnlyOfficePreviewMenuBarProps {
  previewFile: DirectoryFile | null;
  onClose: () => void;
  appendEditorFile: (file: DirectoryFile) => void;
  file: DirectoryFile;
}

const PreviewMenuBar: FC<OnlyOfficePreviewMenuBarProps> = ({ previewFile, appendEditorFile, onClose, file }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  return (
    <div className="flex w-full justify-between space-x-2">
      <button
        type="button"
        className="mr-1 rounded bg-blue-500 px-4 text-white hover:bg-blue-700 "
        onClick={onClose}
      >
        <MdMinimize className="inline" />
      </button>
      <button
        type="button"
        className="rounded bg-green-500 px-4 text-white hover:bg-red-700"
        onClick={() => {
          if (previewFile != null) {
            appendEditorFile(previewFile);
            searchParams.set('editFile', file.basename);
            setSearchParams(searchParams);
            navigate({
              pathname: window.location.pathname,
              search: searchParams.toString(),
            });
            onClose();
          }
        }}
      >
        <MdOutlineOpenInFull className="inline" />
      </button>
    </div>
  );
};
export default PreviewMenuBar;
