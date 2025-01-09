import React, { useState } from 'react';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';
import DeleteBulletinsDialog from '@/pages/BulletinBoardEditorial/DeleteBulletinsDialog';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import ImageModal from '@/components/shared/ImageModal';
import BulletinBoardColumnHeader from '@/pages/BulletinBoard/components/BulletinBoardColumnHeader';
import BulletinBoardColumnItem from '@/pages/BulletinBoard/components/BulletinBoardColumnItem';

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

      {selectedImageForPreview && (
        <ImageModal
          isOpen={isImagePreviewModalOpen}
          imageUrl={selectedImageForPreview}
          onClose={closeImagePreviewModal}
        />
      )}

      <CreateOrUpdateBulletinDialog onSubmit={getBulletinsByCategories} />
      <DeleteBulletinsDialog onSubmit={getBulletinsByCategories} />
    </div>
  );
};

export default BulletinBoardPageColumn;
