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
import Creator from '@libs/common/types/creator';
import { CalendarClock } from 'lucide-react';
import formatIsoDateToLocaleString from '@libs/common/utils/Date/formatIsoDateToLocaleString';

interface PublicShareMetaDetailsProps {
  filename: string;
  creator: Creator;
  expires: Date;
}

const PublicShareMetaDetails: React.FC<PublicShareMetaDetailsProps> = ({ filename, creator, expires }) => {
  const { t } = useTranslation();
  return (
    <>
      <header className="flex items-start gap-3">
        <p>{t('filesharing.publicFileSharing.nameOfContent')} </p>
        <p className="truncate text-background">{filename}</p>
      </header>

      <div className="mt-4 flex items-center gap-2 text-background">
        <p>{t('filesharing.publicFileSharing.sharedBy')} </p>
        <p className="truncate">{`${creator?.firstName} ${creator?.lastName}`}</p>
      </div>

      <ul className="mt-6 space-y-1 text-sm text-white/80">
        <li className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          <span>
            <strong>{t('filesharing.publicFileSharing.validUntil')}:</strong>{' '}
            {formatIsoDateToLocaleString(expires.toLocaleString())}
          </span>
        </li>
      </ul>
    </>
  );
};

export default PublicShareMetaDetails;
