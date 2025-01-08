import React, { useState } from 'react';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';
import DeleteBulletinsDialog from '@/pages/BulletinBoardEditorial/DeleteBulletinsDialog';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinBoardColumnHeader from '@/pages/BulletinBoard/components/BulletinBoardColumnHeader';
import BulletinBoardColumnItem from '@/pages/BulletinBoard/components/BulletinBoardColumnItem';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
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
      <div className="flex flex-col gap-4 overflow-y-auto pb-20 text-white">
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
          <div className="flex h-full w-full items-center justify-center bg-foreground">
            <img
              src={selectedImageForPreview}
              alt="Preview"
              className="max-h-screen max-w-full rounded-md"
            />
          </div>
        </ResizableWindow>
      )}

      <CreateOrUpdateBulletinDialog onSubmit={getBulletinsByCategories} />
      <DeleteBulletinsDialog onSubmit={getBulletinsByCategories} />
    </div>
  );
};

export default BulletinBoardPageColumn;
