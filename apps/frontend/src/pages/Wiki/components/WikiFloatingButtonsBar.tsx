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
import { faFloppyDisk, faPen, faPlus, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { t } from 'i18next';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import CreateButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/createButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';
import useWikiPage from '@/pages/Wiki/hooks/useWikiPage';

const WikiFloatingButtonsBar: React.FC = () => {
  const {
    selectedRegistrationId,
    selectedPagePath,
    isEditing,
    isCreatingNewPage,
    setIsEditing,
    setIsDeleteDialogOpen,
    setIsDeleteWikiMode,
    setIsCreateWikiDialogOpen,
    startNewPage,
    cancelEditing,
    hasUnsavedChanges,
    editorTitle,
  } = useWikiStore();
  const { handleSave, isSaving } = useWikiPage();

  const showSaveButton =
    isEditing && !isSaving && (hasUnsavedChanges || isCreatingNewPage) && editorTitle.trim().length > 0;

  const config: FloatingButtonsBarConfig = {
    buttons: [
      ...(selectedRegistrationId
        ? [
            {
              icon: faPlus,
              text: t('wiki.newPage'),
              onClick: startNewPage,
            },
            {
              icon: faFloppyDisk,
              text: isSaving ? t('common.saving') : t('common.save'),
              onClick: () => {
                handleSave().catch(() => {});
              },
              isVisible: showSaveButton,
            },
            {
              icon: faXmark,
              text: t('common.cancel'),
              onClick: cancelEditing,
              isVisible: isEditing,
            },
            ...(selectedPagePath
              ? [
                  {
                    icon: faPen,
                    text: t('common.edit'),
                    onClick: () => setIsEditing(true),
                    isVisible: !isEditing,
                  },
                  ...(selectedPagePath !== WIKI_CONSTANTS.INDEX_PAGE_NAME
                    ? [DeleteButton(() => setIsDeleteDialogOpen(true), true)]
                    : []),
                ]
              : []),
            {
              icon: faTrash,
              text: t('wiki.deleteWiki'),
              onClick: () => {
                setIsDeleteWikiMode(true);
                setIsDeleteDialogOpen(true);
              },
            },
          ]
        : [CreateButton(() => setIsCreateWikiDialogOpen(true))]),
    ],
    keyPrefix: 'wiki-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default WikiFloatingButtonsBar;
