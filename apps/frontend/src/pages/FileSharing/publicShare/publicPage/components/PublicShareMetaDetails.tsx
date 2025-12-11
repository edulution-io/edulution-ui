/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
