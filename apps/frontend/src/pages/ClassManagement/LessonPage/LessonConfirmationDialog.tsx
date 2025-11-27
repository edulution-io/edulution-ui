/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { t } from 'i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import type ClassmanagementButtonConfigProps from '@libs/classManagement/types/classmanagementButtonConfigProps';
import ItemDialogList from '@/components/shared/ItemDialogList';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

type ConfirmationDialogProps = ClassmanagementButtonConfigProps & {
  member: LmnUserInfo[];
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
        <ItemDialogList
          deleteWarningTranslationId={t(`classmanagement.${title}Description`, { count: member.length })}
          items={member.map((i) => ({ name: i.displayName, id: i.cn }))}
        />
      </div>
    );
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={disableAction}
      handleSubmit={enableAction}
      cancelButtonVariant="btn-attention"
      cancelButtonText={t(disableText || 'classmanagement.deactivate')}
      submitButtonText={t(enableText || 'classmanagement.activate')}
    />
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
