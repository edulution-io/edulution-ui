import React from 'react';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH.tsx';
import { t } from 'i18next';

interface StartExamModeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const getDialogBody = () => {
  return (
    <div className="text-black">
      <p>{t('schoolManagement.examModeDescription')}</p>
    </div>
  );
};

const getFooter = (onClose: () => void, onConfirm: () => void) => {
  return (
    <div className="mt-4 flex justify-between space-x-4">
      <button
        className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        onClick={onClose}
      >
        {t('schoolManagement.cancelStartExamMode')}
      </button>
      <button
        className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        onClick={onConfirm}
      >
        {t('schoolManagement.startExamMode')}
      </button>
    </div>
  );
};

const StartExamModeDialog: React.FC<StartExamModeDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <AdaptiveDialogSH
      isOpen={open}
      handleOpenChange={onClose}
      title={t('schoolManagement.examMode')}
      body={getDialogBody()}
      footer={getFooter(onClose, onConfirm)}
    />
  );
};

export default StartExamModeDialog;
