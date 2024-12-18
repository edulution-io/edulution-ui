import React from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

/*
 TODO: Change to window frame after #263 is merged, see https://github.com/edulution-io/edulution-ui/issues/319
 */
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-50 rounded-full bg-white/50 px-3 py-3 text-2xl hover:bg-gray-600"
        aria-label="Close Modal"
      >
        <MdClose />
      </button>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
      <img
        onClick={(e) => e.stopPropagation()}
        src={imageUrl}
        alt="Preview"
        className="w-[80%] rounded-md"
      />
    </div>,
    document.body,
  );
};

export default ImageModal;
