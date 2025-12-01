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
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

interface DeleteDockerContainersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  containerNames: string[];
  onConfirmDelete: () => Promise<void>;
  isLoading?: boolean;
}

const DeleteDockerContainersDialog: React.FC<DeleteDockerContainersDialogProps> = ({
  isOpen,
  onOpenChange,
  containerNames,
  onConfirmDelete,
  isLoading = false,
}) => {
  const handleConfirmDelete = async () => {
    await onConfirmDelete();
    onOpenChange(false);
  };

  return (
    <DeleteConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      items={containerNames.map((name) => ({ id: name, name }))}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isLoading}
      titleTranslationKey="settings.appconfig.sections.docker.deleteContainers"
      messageTranslationKey={
        containerNames.length > 1
          ? 'settings.appconfig.sections.docker.confirmMultiDeleteContainer'
          : 'settings.appconfig.sections.docker.confirmSingleDeleteContainer'
      }
    />
  );
};

export default DeleteDockerContainersDialog;
