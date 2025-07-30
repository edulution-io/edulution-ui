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

import React, { useMemo } from 'react';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';

const PublicShareFilesFloatingButtonsBar: React.FC = () => {
  const { selectedRows, openDialog, shares } = usePublicShareStore();
  const selectedIds = Object.keys(selectedRows).filter((id) => selectedRows[id]);
  const selectedRowsCount = selectedIds.length;

  const currentShare = selectedRowsCount === 1 ? shares.find((s) => selectedIds.includes(s.publicShareId)) : undefined;

  const config: FloatingButtonsBarConfig | null = useMemo(() => {
    if (selectedRowsCount === 0) return null;

    const buttons = [DeleteButton(() => openDialog(PUBLIC_SHARE_DIALOG_NAMES.DELETE))];

    if (selectedRowsCount === 1 && currentShare) {
      buttons.push(EditButton(() => openDialog(PUBLIC_SHARE_DIALOG_NAMES.EDIT, currentShare)));
    }

    return { buttons, keyPrefix: `public-file-share_btn_${selectedRowsCount}_` };
  }, [selectedRowsCount, currentShare, openDialog]);

  if (!config) return null;
  return <FloatingButtonsBar config={config} />;
};

export default PublicShareFilesFloatingButtonsBar;
