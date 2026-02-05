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
import BULLETIN_BOARD_GRID_ROWS from '@libs/bulletinBoard/constants/bulletin-board-grid-rows';
import cn from '@libs/common/utils/className';

const BulletinBoardPageColumn = ({
  bulletins,
  categoryCount,
  category,
  canEditCategory,
  gridRows,
}: {
  categoryCount: number;
  category: BulletinCategoryResponseDto;
  bulletins: BulletinResponseDto[];
  canEditCategory: boolean;
  gridRows: string;
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

  const isSingleRow = gridRows === BULLETIN_BOARD_GRID_ROWS.ONE;
  const isMultiRow = !isSingleRow;
  const width = isSingleRow ? `${100 / categoryCount}%` : undefined;

  const getRowCount = () => {
    if (gridRows === BULLETIN_BOARD_GRID_ROWS.TWO) return 2;
    if (gridRows === BULLETIN_BOARD_GRID_ROWS.THREE) return 3;
    return 2;
  };

  const getMaxHeight = () => {
    if (!isMultiRow) return undefined;
    return `calc((100vh - 180px) / ${getRowCount()})`;
  };

  return (
    <div
      style={{ width, maxHeight: getMaxHeight() }}
      className={cn(
        'flex w-full flex-col rounded-lg',
        isSingleRow && 'max-h-full min-w-[85vw] flex-shrink-0 pr-2 md:ml-0 md:min-w-[400px] md:pr-3 md:pt-3',
        isMultiRow && 'overflow-hidden',
      )}
    >
      <BulletinBoardColumnHeader
        category={category}
        canEditCategory={canEditCategory}
      />
      <div
        className={cn(
          'flex flex-col gap-4 overflow-y-auto pt-1 text-background scrollbar-thin',
          isSingleRow && 'mb-2 pb-20',
          isMultiRow && 'mb-1 flex-1 pb-4',
        )}
      >
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
