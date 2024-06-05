import { MdFullscreen } from 'react-icons/md';
import React, { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DirectoryFile } from '@/datatypes/filesystem.ts';
import { IoMdArrowForward } from 'react-icons/io';

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
    <div className="flex w-full justify-end space-x-2">
      <button
        type="button"
        className="hover:bg-grey-700 mr-1 rounded bg-white px-4 text-white "
        onClick={onClose}
      >
        <IoMdArrowForward className="inline text-black" />
      </button>
      <button
        type="button"
        className="hover:bg-grey-700 rounded bg-white px-4 text-white"
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
        <MdFullscreen className="inline text-black" />
      </button>
    </div>
  );
};
export default PreviewMenuBar;
