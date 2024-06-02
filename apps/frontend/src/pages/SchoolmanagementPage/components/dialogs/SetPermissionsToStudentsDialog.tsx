import React from 'react';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH.tsx';
import { t } from 'i18next';
import { MemberInfo } from '@/datatypes/schoolclassInfo.ts';

interface SetPremissionsToStudentsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  members: MemberInfo[];
}

const getDialogBody = (message: string, members: MemberInfo[]) => {
  return (
    <div className="text-black">
      <p>{message}</p>
      <div className="mt-4">
        {members?.map((member) => (
          <div
            key={member.id}
            className="flex justify-between"
          >
            <p>{member.firstName + member.lastName}</p>
          </div>
        ))}
      </div>
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
        {t('schoolManagement.turnOff')}
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

const SetPremissionsToStudentsDialog: React.FC<SetPremissionsToStudentsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  members,
}) => {
  return (
    <AdaptiveDialogSH
      isOpen={open}
      handleOpenChange={onClose}
      title={title}
      body={getDialogBody(message, members)}
      footer={getFooter(onClose, onConfirm, confirmText)}
    />
  );
};

export default SetPremissionsToStudentsDialog;
