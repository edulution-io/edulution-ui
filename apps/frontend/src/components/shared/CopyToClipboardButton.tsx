import React from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/shared/Button';

interface CopyToClipboardButtonProps {
  copiedText: string;
  variant?: ButtonVariant;
  className?: string;
}

const CopyToClipboardButton = (props: CopyToClipboardButtonProps) => {
  const { copiedText, variant = 'btn-collaboration' as ButtonVariant, className = 'flex justify-center' } = props;
  const { t } = useTranslation();

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(copiedText)
      .then(() => {
        toast.info(t('common.savedToClipboard'));
      })
      .catch(() => {
        toast.error(t('common.savedToClipboardError'));
      });
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => copyToClipboard()}
      className={className}
    >
      {t('common.copyToClipboard')}
    </Button>
  );
};

export default CopyToClipboardButton;
