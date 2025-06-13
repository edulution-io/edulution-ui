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
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';

const PublicShareFilesFloatingButtonsBar: React.FC = () => {
  const { selectedFilesToShareRows, setIsShareFileDeleteDialogOpen, setIsShareFileEditDialogOpen } =
    usePublicShareFilesStore();

  const config: FloatingButtonsBarConfig | null = useMemo(() => {
    const count = selectedFilesToShareRows.length;
    if (count === 0) return null;

    const buttons = [DeleteButton(() => setIsShareFileDeleteDialogOpen(true))];

    if (count === 1) {
      buttons.push(EditButton(() => setIsShareFileEditDialogOpen(true)));
    }

    return {
      buttons,
      keyPrefix: `public-file-share_btn_${count}_`,
    };
  }, [selectedFilesToShareRows, setIsShareFileDeleteDialogOpen, setIsShareFileEditDialogOpen]);

  if (!config) return null;

  return <FloatingButtonsBar config={config} />;
};

export default PublicShareFilesFloatingButtonsBar;
