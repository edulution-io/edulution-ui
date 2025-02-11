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

import React, { useState } from 'react';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';
import DeleteBulletinsDialog from '@/pages/BulletinBoardEditorial/DeleteBulletinsDialog';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinBoardColumnHeader from '@/pages/BulletinBoard/components/BulletinBoardColumnHeader';
import BulletinBoardColumnItem from '@/pages/BulletinBoard/components/BulletinBoardColumnItem';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import FullScreenImage from '@/components/ui/FullScreenImage';
import { useTranslation } from 'react-i18next';

const BulletinBoardPageColumn = ({
  bulletins,
  categoryCount,
  category,
  canEditCategory,
  canManageBulletins,
}: {
  categoryCount: number;
  category: BulletinCategoryResponseDto;
  bulletins: BulletinResponseDto[];
  canEditCategory: boolean;
  canManageBulletins: boolean;
}) => {
  const { t } = useTranslation();
  const { getBulletinsByCategories } = useBulletinBoardStore();
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);
  const [selectedImageForPreview, setSelectedImageForPreview] = useState<string | null>(null);

  const handleImagePreviewClick = (imageUrl: string) => {
    setSelectedImageForPreview(imageUrl);
    setIsImagePreviewModalOpen(true);
  };

  const closeImagePreviewModal = () => {
    setSelectedImageForPreview(null);
    setIsImagePreviewModalOpen(false);
  };

  const width = `${100 / categoryCount}%`;

  return (
    <div
      style={{ width }}
      className="flex h-full w-full min-w-[400px] flex-shrink-0 flex-col rounded-lg px-2 md:ml-0 md:p-3"
    >
      <BulletinBoardColumnHeader
        category={category}
        canEditCategory={canEditCategory}
      />
      <div className="flex flex-col gap-4 overflow-y-auto pb-20 text-background scrollbar-thin">
        {bulletins.map((bulletin) => (
          <BulletinBoardColumnItem
            key={bulletin.id}
            bulletin={bulletin}
            canManageBulletins={canManageBulletins}
            handleImageClick={handleImagePreviewClick}
          />
        ))}
      </div>

      {selectedImageForPreview && isImagePreviewModalOpen && (
        <ResizableWindow
          disableMinimizeWindow
          disableToggleMaximizeWindow
          titleTranslationId={t('preview.image')}
          handleClose={closeImagePreviewModal}
        >
          <FullScreenImage imageSrc={selectedImageForPreview} />
        </ResizableWindow>
      )}

      <CreateOrUpdateBulletinDialog onSubmit={getBulletinsByCategories} />
      <DeleteBulletinsDialog onSubmit={getBulletinsByCategories} />
    </div>
  );
};

export default BulletinBoardPageColumn;
