import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import CircleLoader from '@/components/ui/CircleLoader';

interface DeleteBulletinsDialogProps {
  trigger?: React.ReactNode;
}

const DeleteBulletinsDialog = ({ trigger }: DeleteBulletinsDialogProps) => {
  const {
    selectedRows,
    isDialogLoading,
    error,
    reset,
    deleteBulletins,
    bulletins,
    isDeleteBulletinDialogOpen,
    setIsDeleteBulletinDialogOpen,
  } = useBulletinBoardEditorialStore();
  const { t } = useTranslation();

  const selectedBulletinIds = Object.keys(selectedRows);
  const selectedBulletins = bulletins.filter((b) => selectedBulletinIds.includes(b.id));
  const isMultiDelete = selectedBulletins.length > 1;

  const onSubmit = async () => {
    await deleteBulletins(selectedBulletins);
    setIsDeleteBulletinDialogOpen(false);
  };

  const getDialogBody = () => {
    if (isDialogLoading) return <CircleLoader />;

    return (
      <div className="text-foreground">
        {error ? (
          <>
            {t('bulletinboard.error')}: {error.message}
          </>
        ) : (
          <>
            {t(isMultiDelete ? 'bulletinboard.confirmMultiDelete' : 'bulletinboard.confirmSingleDelete')}
            {selectedBulletins.map((b) => (
              <div
                className="mt-2"
                key={b.id}
              >
                - {b.title}
              </div>
            ))}
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
          disabled={isDialogLoading}
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
          onClick={() => reset()}
        >
          {t('bulletinboard.cancel')}
        </Button>
      </div>
    );

  return (
    <AdaptiveDialog
      isOpen={isDeleteBulletinDialogOpen}
      trigger={trigger}
      handleOpenChange={() => setIsDeleteBulletinDialogOpen(!isDeleteBulletinDialogOpen)}
      title={t(isMultiDelete ? 'bulletinboard.deleteBulletins' : 'bulletinboard.deleteBulletin', {
        count: selectedBulletins.length,
      })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteBulletinsDialog;
