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
      <p className="font-bold">{t(titleTranslationId)}</p>
      <div className="flex flex-col items-center justify-center">
        <QRCodeDisplay
          value={url}
          size={qrCodeSize}
        />
        <div className="mb-4 mt-4 rounded-xl bg-secondary px-2 py-1 text-center">{url}</div>
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
