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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import CircleLoader from '@/components/ui/CircleLoader';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';

interface DeleteBulletinsCategoriesDialogProps {
  trigger?: React.ReactNode;
}

const DeleteBulletinsCategoriesDialog = ({ trigger }: DeleteBulletinsCategoriesDialogProps) => {
  const {
    selectedCategory,
    setSelectedCategory,
    deleteCategory,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleteDialogLoading,
    fetchTableContent,
    error,
  } = useBulletinCategoryTableStore();

  const { t } = useTranslation();

  if (!selectedCategory) return null;

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
    setIsDeleteDialogOpen(false);
  };

  const onSubmit = async () => {
    if (!selectedCategory.id) return;
    await deleteCategory(selectedCategory.id);
    await fetchTableContent();
    handleClose();
  };

  const getDialogBody = () => {
    if (isDeleteDialogLoading) return <CircleLoader />;

    return (
      <div className="text-background">
        {error ? (
          <>
            {t('bulletinboard.error')}: {error.message}
          </>
        ) : (
          <>
            <div>{t('bulletinboard.confirmSingleCategoryDelete')}</div>
            <div className="m-2 font-bold">{selectedCategory.name}</div>
            <div className="mt-3 rounded-lg border border-red-400 p-3">
              {t('bulletinboard.confirmSingleCategoryDeleteWarning')}
            </div>
          </>
        )}
      </div>
    );
  };

  const getFooter = () =>
    !error ? (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          disabled={isDeleteDialogLoading}
          size="lg"
          onClick={onSubmit}
        >
          {t('bulletinboard.delete')}
        </Button>
      </div>
    ) : (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          size="lg"
          onClick={handleClose}
        >
          {t('bulletinboard.cancel')}
        </Button>
      </div>
    );

  return (
    <AdaptiveDialog
      isOpen={isDeleteDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('bulletinboard.deleteBulletinCategory')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteBulletinsCategoriesDialog;
