import React from 'react';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import copyToClipboard from '@/utils/copyToClipboard';
import { PiEyeLight, PiEyeSlash } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';

const CopyToClipboardTextCell = ({
  url,
  isPublic,
  className,
  iconSize,
  textTranslationId,
}: {
  iconSize: number;
  className: string;
  isPublic: boolean;
  url: string;
  textTranslationId: string;
}) => {
  const { t } = useTranslation();

  return (
    <SelectableTextCell
      className={className}
      onClick={
        isPublic
          ? () => {
              copyToClipboard(url);
            }
          : undefined
      }
      text={t(`${textTranslationId}.${isPublic ? 'isPublicTrue' : 'isPublicFalse'}`)}
      textOnHover={isPublic ? t('common.copy.link') : ''}
      icon={
        isPublic ? (
          <PiEyeLight
            width={iconSize}
            height={iconSize}
          />
        ) : (
          <PiEyeSlash
            width={iconSize}
            height={iconSize}
          />
        )
      }
    />
  );
};

export default CopyToClipboardTextCell;
