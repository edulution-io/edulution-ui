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
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useNotificationStore from '@/store/useNotificationStore';

interface DeleteAllNotificationsDialogProps {
  deleteType: NotificationFilterType;
  notificationCount: number;
}

const DeleteAllNotificationsDialog = ({ deleteType, notificationCount }: DeleteAllNotificationsDialogProps) => {
  const { t } = useTranslation();
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, deleteAllByType, isDeleting } = useNotificationStore();

  const handleClose = () => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleConfirm = async () => {
    await deleteAllByType(deleteType);
  };

  const getTitle = () => {
    switch (deleteType) {
      case NOTIFICATION_FILTER_TYPE.USER:
        return t('notificationscenter.deleteAllMessages');
      case NOTIFICATION_FILTER_TYPE.SYSTEM:
        return t('notificationscenter.deleteAllSystem');
      case NOTIFICATION_FILTER_TYPE.SENT:
        return t('notificationscenter.deleteAllSent');
      default:
        return t('notificationscenter.deleteAll');
    }
  };

  const getMessage = () => {
    switch (deleteType) {
      case NOTIFICATION_FILTER_TYPE.USER:
        return t('notificationscenter.confirmDeleteMessages', { count: notificationCount });
      case NOTIFICATION_FILTER_TYPE.SYSTEM:
        return t('notificationscenter.confirmDeleteSystem', { count: notificationCount });
      case NOTIFICATION_FILTER_TYPE.SENT:
        return t('notificationscenter.confirmDeleteSent', { count: notificationCount });
      default:
        return t('notificationscenter.confirmDeleteAll', { count: notificationCount });
    }
  };

  const getDialogBody = () => (
    <div className="text-background">
      <p>{getMessage()}</p>
      <p className="mt-3 text-sm text-muted-foreground">{t('notificationscenter.actionCannotBeUndone')}</p>
    </div>
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handleConfirm}
      submitButtonText={isDeleting ? t('common.deleting') : t('common.delete')}
      disableCancel={isDeleting}
      disableSubmit={isDeleting || notificationCount === 0}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isDeleteDialogOpen}
      handleOpenChange={handleClose}
      title={getTitle()}
      body={getDialogBody()}
      footer={getFooter()}
      mobileContentClassName="z-[600]"
      desktopContentClassName="z-[600]"
    />
  );
};

export default DeleteAllNotificationsDialog;
