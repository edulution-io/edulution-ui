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
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { PiEyeLight, PiEyeSlash } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';

const OpenShareQRDialogTextCell = ({
  openDialog,
  isPublic,
  className,
  iconSize,
  textTranslationId,
}: {
  openDialog: () => void;
  iconSize: number;
  className?: string;
  isPublic: boolean;
  textTranslationId: string;
}) => {
  const { t } = useTranslation();

  return (
    <SelectableTextCell
      className={className}
      onClick={isPublic ? () => openDialog() : undefined}
      text={t(`${textTranslationId}.${isPublic ? 'isPublicTrue' : 'isPublicFalse'}`)}
      textOnHover={isPublic ? t('common.share') : ''}
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

export default OpenShareQRDialogTextCell;
