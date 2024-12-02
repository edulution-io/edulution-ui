import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import { Button } from '@/components/shared/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ToasterTranslationIds from '@libs/ui/types/toasterTranslationIds';
import copyToClipboard from '@/utils/copyToClipboard';
import { Sizes } from '@libs/ui/types/sizes';

interface QRCodeWithCopyButtonProps {
  url: string;
  titleTranslationId: string;
  toasterTranslationIds?: ToasterTranslationIds;
  qrCodeSize?: Sizes;
}

const QRCodeWithCopyButton = ({
  url,
  qrCodeSize,
  titleTranslationId,
  toasterTranslationIds,
}: QRCodeWithCopyButtonProps) => {
  const { t } = useTranslation();

  return (
    <>
      <p>{t(titleTranslationId)}</p>
      <div className="flex flex-col items-center justify-center">
        <QRCodeDisplay
          value={url}
          size={qrCodeSize}
        />
        <div className="mb-4 mt-4 rounded-xl bg-ciLightGrey px-2 py-1 text-center">{url}</div>
        <Button
          size="lg"
          type="button"
          variant="btn-collaboration"
          onClick={() => copyToClipboard(url, toasterTranslationIds)}
        >
          {t('common.copy.doCopy')}
        </Button>
      </div>
    </>
  );
};

export default QRCodeWithCopyButton;
