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
import { faTable, faColumns, faGrip } from '@fortawesome/free-solid-svg-icons';
import BULLETIN_BOARD_GRID_ROWS from '@libs/bulletinBoard/constants/bulletin-board-grid-rows';
import FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';

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

  const { isEditorialModeEnabled, setIsEditorialModeEnabled, gridRows, setGridRows } = useBulletinBoardStore();

  const hasTheUserEditPermissionToCategories = categoriesWithEditPermission.length > 0;

  const selectedBulletinIds = Object.keys(selectedRows);

  const onSwitchEditorialModeButtonClick = () => {
    setIsEditorialModeEnabled(!isEditorialModeEnabled);
    setSelectedRows({});
  };

  const gridRowsButton: FloatingButtonConfig = {
    icon: faGrip,
    text: t('bulletinboard.view'),
    variant: 'dropdown',
    dropdownItems: [
      {
        label: t('bulletinboard.viewAuto'),
        isCheckbox: true,
        checked: gridRows === BULLETIN_BOARD_GRID_ROWS.AUTO,
        onCheckedChange: () => setGridRows(BULLETIN_BOARD_GRID_ROWS.AUTO).catch(() => {}),
      },
      {
        label: t('bulletinboard.viewOneRow'),
        isCheckbox: true,
        checked: gridRows === BULLETIN_BOARD_GRID_ROWS.ONE,
        onCheckedChange: () => setGridRows(BULLETIN_BOARD_GRID_ROWS.ONE).catch(() => {}),
      },
      {
        label: t('bulletinboard.viewTwoRows'),
        isCheckbox: true,
        checked: gridRows === BULLETIN_BOARD_GRID_ROWS.TWO,
        onCheckedChange: () => setGridRows(BULLETIN_BOARD_GRID_ROWS.TWO).catch(() => {}),
      },
      {
        label: t('bulletinboard.viewThreeRows'),
        isCheckbox: true,
        checked: gridRows === BULLETIN_BOARD_GRID_ROWS.THREE,
        onCheckedChange: () => setGridRows(BULLETIN_BOARD_GRID_ROWS.THREE).catch(() => {}),
      },
    ],
  };

  const editorialButtons: FloatingButtonConfig[] = hasTheUserEditPermissionToCategories
    ? [
        {
          icon: isEditorialModeEnabled ? faColumns : faTable,
          text: t(`common.${isEditorialModeEnabled ? 'columns' : 'table'}`),
          onClick: onSwitchEditorialModeButtonClick,
        },
        DeleteButton(() => setIsDeleteBulletinDialogOpen(true), selectedBulletinIds.length > 0),
        EditButton(() => {
          setIsCreateBulletinDialogOpen(true);
          setSelectedBulletinToEdit(bulletins.find((b) => b.id === selectedBulletinIds[0]) || null);
        }, selectedBulletinIds.length === 1),
        CreateButton(() => setIsCreateBulletinDialogOpen(true)),
      ]
    : [];

  const config: FloatingButtonsBarConfig = {
    buttons: [gridRowsButton, ...editorialButtons],
    keyPrefix: 'bulletin-board-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default BulletinBoardEditorialFloatingButtonsBar;
