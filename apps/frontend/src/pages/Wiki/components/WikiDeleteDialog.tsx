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
import { useNavigate } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

const WikiDeleteDialog: React.FC = () => {
  const navigate = useNavigate();
  const {
    isDeleteDialogOpen,
    isDeleteWikiMode,
    setIsDeleteDialogOpen,
    selectedRegistrationId,
    selectedPagePath,
    deletePage,
    deleteWiki,
    pages,
    registrations,
  } = useWikiStore();

  const handleDelete = async () => {
    if (isDeleteWikiMode && selectedRegistrationId) {
      await deleteWiki(selectedRegistrationId);
      navigate(`/${APPS.WIKI}`);
    } else if (selectedPagePath && selectedRegistrationId) {
      await deletePage(selectedRegistrationId, selectedPagePath);
    }
  };

  const getItems = () => {
    if (isDeleteWikiMode && selectedRegistrationId) {
      const reg = registrations.find((r) => r.id === selectedRegistrationId);
      return reg ? [{ id: reg.id, name: reg.name }] : [];
    }
    if (selectedPagePath) {
      const page = pages.find((p) => p.relativePath === selectedPagePath);
      return page ? [{ id: page.relativePath, name: page.title }] : [];
    }
    return [];
  };

  const isDeletingWiki = isDeleteWikiMode;

  return (
    <DeleteConfirmationDialog
      isOpen={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      items={getItems()}
      onConfirmDelete={handleDelete}
      titleTranslationKey={isDeletingWiki ? 'wiki.deleteWiki' : 'wiki.deletePage'}
      messageTranslationKey={isDeletingWiki ? 'wiki.confirmDeleteWiki' : 'wiki.confirmDeletePage'}
    />
  );
};

export default WikiDeleteDialog;
