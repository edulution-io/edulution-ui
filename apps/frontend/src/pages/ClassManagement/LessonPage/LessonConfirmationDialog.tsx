import React from 'react';
import { t } from 'i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import type UserLmnInfo from '@libs/lmnApi/types/userInfo';
import type ClassmanagementButtonConfigProps from '@libs/classManagement/types/classmanagementButtonConfigProps';

type ConfirmationDialogProps = ClassmanagementButtonConfigProps & {
  member: UserLmnInfo[];
};

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
  const noMembers = member.length < 1;

  const getDialogBody = () => {
    if (noMembers) return <div className="text-background">{t('classmanagement.noStudentsForAction')}</div>;
    return (
      <div className="text-background">
        <p className="mb-3">{t(`classmanagement.${title}Description`, { count: member.length })}:</p>
        <p className="p-2">{member.map((m) => m.displayName).join(', ')}</p>
      </div>
    );
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-between space-x-4">
      <Button
        variant="btn-attention"
        onClick={disableAction}
      >
        {t(disableText || 'classmanagement.deactivate')}
      </Button>
      <Button
        variant="btn-infrastructure"
        onClick={enableAction}
      >
        {t(enableText || 'classmanagement.activate')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={noMembers ? null : getFooter()}
    />
  );
};

export default LessonConfirmationDialog;
