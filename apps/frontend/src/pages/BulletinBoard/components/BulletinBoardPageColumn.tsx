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

import React, { useState } from 'react';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import DeleteBulletinsDialog from '@/pages/BulletinBoard/BulletinBoardEditorial/DeleteBulletinsDialog';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinBoardColumnHeader from '@/pages/BulletinBoard/components/BulletinBoardColumnHeader';
import BulletinBoardColumnItem from '@/pages/BulletinBoard/components/BulletinBoardColumnItem';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import FullScreenImage from '@/components/ui/FullScreenImage';
import { useTranslation } from 'react-i18next';

const BulletinBoardPageColumn = ({
  bulletins,
  categoryCount,
  category,
  canEditCategory,
}: {
  categoryCount: number;
  category: BulletinCategoryResponseDto;
  bulletins: BulletinResponseDto[];
  canEditCategory: boolean;
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
      className="flex max-h-full w-full min-w-[85vw] flex-shrink-0 flex-col rounded-lg pr-2 md:ml-0 md:min-w-[400px] md:pr-3 md:pt-3"
    >
      <BulletinBoardColumnHeader
        category={category}
        canEditCategory={canEditCategory}
      />
      <div className="mb-2 flex flex-col gap-4 overflow-y-auto pb-20 text-background scrollbar-thin">
        {bulletins.map((bulletin) => (
          <BulletinBoardColumnItem
            key={`${bulletin.id}:${category.bulletinVisibility}`}
            bulletin={bulletin}
            canManageBulletins={canEditCategory}
            handleImageClick={handleImagePreviewClick}
            initialBulletinVisibility={category.bulletinVisibility}
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

      <DeleteBulletinsDialog onSubmit={getBulletinsByCategories} />
    </div>
  );
};

export default BulletinBoardPageColumn;
