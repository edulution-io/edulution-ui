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
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import CreateButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/createButton';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { t } from 'i18next';
import { MdOutlineTableChart, MdOutlineViewColumn } from 'react-icons/md';

const BulletinBoardEditorialFloatingButtonsBar: React.FC = () => {
  const {
    categoriesWithEditPermission,
    setSelectedRows,
    selectedRows,
    bulletins,
    setIsDeleteBulletinDialogOpen,
    setIsCreateBulletinDialogOpen,
    setSelectedBulletinToEdit,
  } = useBulletinBoardEditorialStore();

  const { isEditorialModeEnabled, setIsEditorialModeEnabled } = useBulletinBoardStore();

  const hasTheUserEditPermissionToCategories = categoriesWithEditPermission.length > 0;

  if (!hasTheUserEditPermissionToCategories) {
    return null;
  }

  const selectedBulletinIds = Object.keys(selectedRows);

  const onSwitchEditorialModeButtonClick = () => {
    setIsEditorialModeEnabled(!isEditorialModeEnabled);
    setSelectedRows({});
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: isEditorialModeEnabled ? MdOutlineViewColumn : MdOutlineTableChart,
        text: t(`common.${isEditorialModeEnabled ? 'columns' : 'table'}`),
        onClick: onSwitchEditorialModeButtonClick,
      },
      DeleteButton(() => setIsDeleteBulletinDialogOpen(true), selectedBulletinIds.length > 0),
      EditButton(() => {
        setIsCreateBulletinDialogOpen(true);
        setSelectedBulletinToEdit(bulletins.find((b) => b.id === selectedBulletinIds[0]) || null);
      }, selectedBulletinIds.length === 1),
      CreateButton(() => setIsCreateBulletinDialogOpen(true)),
    ],
    keyPrefix: 'bulletin-board-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default BulletinBoardEditorialFloatingButtonsBar;
