/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
