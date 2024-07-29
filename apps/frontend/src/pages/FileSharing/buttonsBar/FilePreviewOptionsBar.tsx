import { MdFullscreen } from 'react-icons/md';
import React, { FC } from 'react';
import { IoMdArrowForward } from 'react-icons/io';
import { Button } from '@/components/shared/Button';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';

interface FilePreviewOptionsBarProps {}

const FilePreviewOptionsBar: FC<FilePreviewOptionsBarProps> = () => {
  const { setCurrentlyEditingFile } = useFileSharingStore();
  return (
    <div className="flex w-full justify-end space-x-2">
      <Button
        variant="btn-small"
        className="hover:bg-grey-700 mr-1 rounded bg-white px-4 text-white "
        onClick={() => setCurrentlyEditingFile(null)}
      >
        <IoMdArrowForward className="inline text-black" />
      </Button>
      <Button
        variant="btn-small"
        onClick={() => {
          window.open('onlyoffice');
        }}
      >
        <MdFullscreen className="inline text-black" />
      </Button>
    </div>
  );
};
export default FilePreviewOptionsBar;
