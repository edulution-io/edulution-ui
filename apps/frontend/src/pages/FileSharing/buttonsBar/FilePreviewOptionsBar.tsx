import { MdFullscreen } from 'react-icons/md';
import React, { FC } from 'react';
import { IoMdArrowForward } from 'react-icons/io';
import { Button } from '@/components/shared/Button';

interface FilePreviewOptionsBarProps {}

const FilePreviewOptionsBar: FC<FilePreviewOptionsBarProps> = () => (
  <div className="flex w-full justify-end space-x-2">
    <Button
      variant="btn-small"
      className="hover:bg-grey-700 mr-1 rounded bg-white px-4 text-white "
      onClick={() => ({})}
    >
      <IoMdArrowForward className="inline text-black" />
    </Button>
    <Button
      variant="btn-small"
      onClick={() => ({})}
    >
      <MdFullscreen className="inline text-black" />
    </Button>
  </div>
);
export default FilePreviewOptionsBar;
