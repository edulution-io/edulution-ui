/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
