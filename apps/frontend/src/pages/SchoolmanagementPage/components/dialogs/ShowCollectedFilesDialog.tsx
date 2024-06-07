import React from 'react';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH.tsx';
import { t } from 'i18next';

interface ShowCollectedFilesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
}

const CollectFilesDialog: React.FC<ShowCollectedFilesDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
}) => {
  const getDialogBody = (message: string) => {
    return (
      <div className="text-black">
        <p>{message}</p>
      </div>
    );
  };

  const getFooter = (onClose: () => void, onConfirm: () => void, confirmText: string) => {
    return (
      <div className="mt-4 flex justify-between space-x-4">
        <button
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          onClick={onClose}
        >
          {t('schoolManagement.cancel')}
        </button>
        <button
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    );
  };

  return (
    <AdaptiveDialogSH
      isOpen={open}
      handleOpenChange={onClose}
      title={title}
      body={getDialogBody(message)}
      footer={getFooter(onClose, onConfirm, confirmText)}
    />
  );
};

export default CollectFilesDialog;
