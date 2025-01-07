import React from 'react';
import cn from '@libs/common/utils/className';
import { MdClose } from 'react-icons/md';

const CloseButton = ({ handleClose, className }: { handleClose: () => void; className?: string }) => (
  <button
    type="button"
    onClick={handleClose}
    className={cn('flex h-10 w-16 items-center justify-center bg-red-800 p-5 hover:bg-red-700', className)}
  >
    <MdClose />
  </button>
);

export default CloseButton;
