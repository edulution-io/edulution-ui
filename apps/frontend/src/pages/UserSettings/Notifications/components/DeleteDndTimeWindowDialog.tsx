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
import DndTimeWindow from '@libs/notification/types/dndTimeWindow';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

interface DeleteDndTimeWindowDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTimeWindows: DndTimeWindow[];
  onConfirmDelete: () => Promise<void>;
  isLoading?: boolean;
}

const DeleteDndTimeWindowDialog: React.FC<DeleteDndTimeWindowDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedTimeWindows,
  onConfirmDelete,
  isLoading = false,
}) => {
  const isMultiDelete = selectedTimeWindows.length > 1;

  const handleConfirmDelete = async () => {
    await onConfirmDelete();
    onOpenChange(false);
  };

  return (
    <DeleteConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      items={selectedTimeWindows
        .filter((timeWindow) => timeWindow?.id)
        .map((timeWindow) => ({
          id: timeWindow.id,
          name: timeWindow.label || `${timeWindow.startTime} - ${timeWindow.endTime}`,
        }))}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isLoading}
      titleTranslationKey={
        isMultiDelete
          ? 'usersettings.notifications.dnd.deleteMultipleTitle'
          : 'usersettings.notifications.dnd.deleteTitle'
      }
      messageTranslationKey={
        isMultiDelete
          ? 'usersettings.notifications.dnd.deleteConfirmMultiple'
          : 'usersettings.notifications.dnd.deleteConfirmSingle'
      }
    />
  );
};

export default DeleteDndTimeWindowDialog;
