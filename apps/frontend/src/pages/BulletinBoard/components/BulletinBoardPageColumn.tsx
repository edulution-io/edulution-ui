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
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoard/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';
import DeleteBulletinsDialog from '@/pages/BulletinBoard/BulletinBoardEditorial/DeleteBulletinsDialog';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinBoardColumnHeader from '@/pages/BulletinBoard/components/BulletinBoardColumnHeader';
import BulletinBoardColumnItem from '@/pages/BulletinBoard/components/BulletinBoardColumnItem';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import FullScreenImage from '@/components/ui/FullScreenImage';
import { useTranslation } from 'react-i18next';
import FullScreenPdfRenderer from '@/components/ui/FullScreenPdfRenderer';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);

  const handlePreviewClick = (url: string, type: 'image' | 'pdf') => {
    if (type === 'image') {
      setPreviewType('image');
    } else {
      setPreviewType('pdf');
    }
    setPreviewUrl(url);
  };
  const closePreviewModal = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const width = `${100 / categoryCount}%`;

  const isPreviewTypeImage = previewType === 'image';

  return (
    <div
      style={{ width }}
      className="flex max-h-full w-full min-w-[400px] flex-shrink-0 flex-col rounded-lg pr-2 md:ml-0 md:pr-3 md:pt-3"
    >
      <BulletinBoardColumnHeader
        category={category}
        canEditCategory={canEditCategory}
      />
      <div className="mb-2 flex flex-col gap-4 overflow-y-auto pb-20 text-background scrollbar-thin">
        {bulletins.map((bulletin) => (
          <BulletinBoardColumnItem
            key={bulletin.id}
            bulletin={bulletin}
            canManageBulletins={canEditCategory}
            handlePreviewClick={handlePreviewClick}
          />
        ))}
      </div>

      {previewUrl && previewType && (
        <ResizableWindow
          disableMinimizeWindow
          disableToggleMaximizeWindow
          titleTranslationId={t(isPreviewTypeImage ? 'preview.image' : 'preview.pdf')}
          handleClose={closePreviewModal}
        >
          {isPreviewTypeImage ? (
            <FullScreenImage imageSrc={previewUrl} />
          ) : (
            <FullScreenPdfRenderer fileSrc={previewUrl} />
          )}
        </ResizableWindow>
      )}

      <CreateOrUpdateBulletinDialog onSubmit={getBulletinsByCategories} />
      <DeleteBulletinsDialog onSubmit={getBulletinsByCategories} />
    </div>
  );
};

export default BulletinBoardPageColumn;
