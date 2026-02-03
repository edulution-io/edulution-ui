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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import cn from '@libs/common/utils/className';
import useNotificationStore from '@/store/useNotificationStore';

interface NotificationRecipientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notificationId: string;
  notificationTitle: string;
}

const NotificationRecipientsDialog = ({
  isOpen,
  onClose,
  notificationId,
  notificationTitle,
}: NotificationRecipientsDialogProps) => {
  const { t } = useTranslation();
  const { recipients, isLoadingRecipients, fetchRecipients } = useNotificationStore();

  useEffect(() => {
    if (isOpen && notificationId) {
      void fetchRecipients(notificationId);
    }
  }, [isOpen, notificationId, fetchRecipients]);

  const readCount = recipients.filter((r) => r.readAt !== null).length;

  const getDialogBody = () => {
    if (isLoadingRecipients) {
      return (
        <div className="flex items-center justify-center py-8">
          <FontAwesomeIcon
            icon={faSpinner}
            className="h-6 w-6 animate-spin text-primary"
          />
        </div>
      );
    }

    if (recipients.length === 0) {
      return <div className="py-4 text-center text-muted-foreground">{t('notificationscenter.noRecipients')}</div>;
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="mb-2 text-sm text-muted-foreground">
          {t('notificationscenter.recipientsStats', { read: readCount, total: recipients.length })}
        </div>
        <div className="max-h-64 overflow-y-auto scrollbar-thin">
          {recipients.map((recipient) => (
            <div
              key={recipient.username}
              className={cn(
                'flex items-center justify-between rounded px-3 py-2',
                recipient.readAt ? 'bg-green-500/10' : 'bg-muted-foreground/10',
              )}
            >
              <span className="text-sm text-background">{recipient.username}</span>
              {recipient.readAt && (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="h-4 w-4 text-green-500"
                  title={t('notificationscenter.read')}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={notificationTitle}
      body={getDialogBody()}
    />
  );
};

export default NotificationRecipientsDialog;
