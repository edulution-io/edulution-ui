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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import AppConfigIconEditor from './components/AppConfigIconEditor';

interface EditAppConfigIconDialogProps {
  currentIcon: string;
  onIconChange: (icon: string) => void;
}

const EditAppConfigIconDialog: React.FC<EditAppConfigIconDialogProps> = ({ currentIcon, onIconChange }) => {
  const { t } = useTranslation();
  const { isEditIconDialogOpen, setIsEditIconDialogOpen, isLoading } = useAppConfigsStore();
  const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon);

  useEffect(() => {
    if (isEditIconDialogOpen) {
      setSelectedIcon(currentIcon);
    }
  }, [isEditIconDialogOpen, currentIcon]);

  const handleClose = () => {
    setIsEditIconDialogOpen(false);
  };

  const handleSubmit = () => {
    onIconChange(selectedIcon);
    setIsEditIconDialogOpen(false);
  };

  const getDialogBody = () => (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{t('settings.appconfig.editIcon.description')}</p>
      <AppConfigIconEditor
        currentIcon={selectedIcon}
        onIconChange={setSelectedIcon}
      />
      <div className="mt-6">
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          submitButtonText="common.save"
          submitButtonType="button"
          disableSubmit={isLoading || !selectedIcon}
        />
      </div>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isEditIconDialogOpen}
      handleOpenChange={handleClose}
      title={t('settings.appconfig.editIcon.title')}
      body={getDialogBody()}
      desktopContentClassName="max-w-2xl max-h-[95vh]"
    />
  );
};

export default EditAppConfigIconDialog;
