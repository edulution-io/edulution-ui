import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import CircleLoader from '@/components/ui/CircleLoader';
import ItemDialogList from '@/components/shared/ItemDialogList';

interface DeleteBulletinsDialogProps {
  trigger?: React.ReactNode;
  onSubmit?: () => Promise<void>;
}

const DeleteBulletinsDialog = ({ trigger, onSubmit }: DeleteBulletinsDialogProps) => {
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

  const handleSubmit = async () => {
    await deleteBulletins(selectedBulletins);
    setIsDeleteBulletinDialogOpen(false);
    if (onSubmit) {
      await onSubmit();
    }
  };

  const getDialogBody = () => {
    if (isDialogLoading) return <CircleLoader className="mx-auto" />;

    return (
      <div className="text-background">
        {error ? (
          <>
            {t('bulletinboard.error')}: {error.message}
          </>
        ) : (
          <ItemDialogList
            deleteWarningTranslationId={
              isMultiDelete ? 'bulletinboard.confirmMultiDelete' : 'bulletinboard.confirmSingleDelete'
            }
            items={selectedBulletins.map((b) => ({ name: b.title, id: b.id }))}
          />
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
          onClick={handleSubmit}
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
