import React from 'react';
import { t } from 'i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';

interface ConfirmationDialogProps {
  title: string;
  member: UserLmnInfo[];
  isOpen: boolean;
  onClose: () => void;
  enableAction: () => void;
  disableAction: () => void;
  enableText?: string;
  disableText?: string;
}

const LessonConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  member,
  isOpen,
  title,
  onClose,
  enableAction,
  disableAction,
  enableText,
  disableText,
}) => {
  const getDialogBody = () => (
    <div className="text-foreground">
      <p className="mb-3">{t(`classmanagement.${title}Description`, { count: member.length })}:</p>
      <p className="p-2">{member.map((m) => m.displayName).join(', ')}</p>
    </div>
  );

  const getFooter = () => (
    <div className="mt-4 flex justify-between space-x-4">
      <button
        type="button"
        className="hover:ciRed rounded-md bg-ciLightRed px-4 py-2 text-foreground"
        onClick={disableAction}
      >
        {t(disableText || 'classmanagement.deactivate')}
      </button>
      <button
        type="button"
        className="hover:ciGreen rounded-md bg-ciLightGreen px-4 py-2 text-foreground"
        onClick={enableAction}
      >
        {t(enableText || 'classmanagement.activate')}
      </button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default LessonConfirmationDialog;
