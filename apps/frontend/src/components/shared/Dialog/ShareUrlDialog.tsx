import React from 'react';
import { useTranslation } from 'react-i18next';
import useShareUrlDialogStore from '@/components/shared/Dialog/useShareUrlDialogStore';
import CopyToClipboardButton from '@/components/shared/CopyToClipboardButton';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface ShareUrlDialogProps {
  url: string;
}

const ShareUrlDialog = (props: ShareUrlDialogProps) => {
  const { url } = props;

  const { isOpen, setIsOpen } = useShareUrlDialogStore();

  const { t } = useTranslation();

  const getDialogBody = () => (
    <div className="flex flex-col items-center justify-center">
      <QRCodeDisplay
        className="mb-4"
        value={url}
      />
      <div className="mb-4 truncate rounded-xl bg-ciLightGrey px-2 py-1">{url}</div>
      <CopyToClipboardButton copiedText={url} />
    </div>
  );

  if (!isOpen) return null;
  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={() => setIsOpen(!isOpen)}
      title={t('common.dialogs.shareUrlDialog.title')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[50%] max-h-[75%] min-h-fit-content"
    />
  );
};

export default ShareUrlDialog;
