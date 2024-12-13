import { Button } from '@/components/shared/Button';
import { MdDelete, MdUpdate } from 'react-icons/md';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CreateAndUpdateBulletinCategoryFooterProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  isCurrentNameEqualToSelected: () => boolean;
  isSaveButtonDisabled: () => boolean;
  handleDeleteCategory: () => void;
}

const CreateAndUpdateBulletinCategoryFooter = ({
  handleFormSubmit,
  isCurrentNameEqualToSelected,
  isSaveButtonDisabled,
  handleDeleteCategory,
}: CreateAndUpdateBulletinCategoryFooterProps) => {
  const { t } = useTranslation();
  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-4"
    >
      <div className="mt-4 flex justify-end space-x-2">
        {isCurrentNameEqualToSelected() && (
          <Button
            variant="btn-attention"
            size="lg"
            type="button"
            onClick={() => handleDeleteCategory()}
          >
            <MdDelete size={20} />
            {t('common.delete')}
          </Button>
        )}

        <Button
          variant="btn-collaboration"
          size="lg"
          disabled={isSaveButtonDisabled()}
          type="submit"
        >
          <MdUpdate size={20} />
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default CreateAndUpdateBulletinCategoryFooter;
