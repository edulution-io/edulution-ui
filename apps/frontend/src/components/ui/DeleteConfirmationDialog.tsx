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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import ItemList from '@/components/shared/ItemList';
import ListItem from '@libs/ui/types/listItem';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: ListItem[];
  onConfirmDelete: () => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
  titleTranslationKey: string;
  messageTranslationKey: string;
  warningTranslationKey?: string;
  trigger?: React.ReactNode;
  autoCloseOnSuccess?: boolean;
  translationParams?: Record<string, string>;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  items,
  onConfirmDelete,
  isLoading = false,
  error = null,
  titleTranslationKey,
  messageTranslationKey,
  warningTranslationKey,
  trigger,
  autoCloseOnSuccess = true,
  translationParams = {},
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmDelete();
      if (autoCloseOnSuccess) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => onOpenChange(false);

  const isDisabled = isLoading || isSubmitting || items.length === 0;

  const getDialogBody = () => {
    if (error) {
      return (
        <div className="text-background">
          {t('common.error')}: {error.message}
        </div>
      );
    }

    if (items.length === 0) {
      return <div className="text-background">{t('common.noItemsSelected')}</div>;
    }

    return (
      <div className="text-background">
        <p>{t(messageTranslationKey, { count: items.length, ...translationParams })}</p>
        <ItemList items={items} />
        {warningTranslationKey && (
          <div className="mt-3 rounded-lg border border-red-400 p-3">{t(warningTranslationKey)}</div>
        )}
      </div>
    );
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      submitButtonText={isSubmitting ? t('common.deleting') : t('common.delete')}
      disableCancel={isSubmitting}
      disableSubmit={isDisabled}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t(titleTranslationKey, { count: items.length, ...translationParams })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteConfirmationDialog;
