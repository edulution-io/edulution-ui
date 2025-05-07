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
import { useTranslation } from 'react-i18next';
import { MdFileCopy } from 'react-icons/md';
import { Sizes } from '@libs/ui/types/sizes';
import copyToClipboard from '@/utils/copyToClipboard';
import Input from '@/components/shared/Input';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';

interface QRCodeWithCopyButtonProps {
  url: string;
  titleTranslationId: string;
  qrCodeSize?: Sizes;
}

const QRCodeWithCopyButton = ({ url, qrCodeSize, titleTranslationId }: QRCodeWithCopyButtonProps) => {
  const { t } = useTranslation();

  return (
    <>
      <p className="font-bold">{t(titleTranslationId)}</p>
      <div className="mt-4 flex flex-col items-center justify-center space-y-8">
        <QRCodeDisplay
          value={url}
          size={qrCodeSize}
        />
        <Input
          type="text"
          value={url}
          readOnly
          className="w-fit min-w-[550px] cursor-pointer"
          onClick={() => copyToClipboard(url)}
          icon={<MdFileCopy />}
        />
      </div>
    </>
  );
};

export default QRCodeWithCopyButton;
