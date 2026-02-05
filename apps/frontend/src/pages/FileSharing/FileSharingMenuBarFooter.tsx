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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import useLmnApiStore from '@/store/useLmnApiStore';
import useQuotaInfo from '@/hooks/useQuotaInfo';
import { cn } from '@edulution-io/ui-kit';
import WebdavInfoDialog from '@/pages/FileSharing/Dialog/WebdavInfoDialog';

interface FileSharingMenuBarFooterProps {
  isCollapsed: boolean;
}

const FileSharingMenuBarFooter: React.FC<FileSharingMenuBarFooterProps> = ({ isCollapsed }) => {
  const { t } = useTranslation();
  const { user: lmnUser } = useLmnApiStore();
  const { quotaUsedInGb, quotaHardLimitInGb, percentageUsed, progressBarColor } = useQuotaInfo();
  const [isWebdavDialogOpen, setIsWebdavDialogOpen] = useState(false);

  if (isCollapsed) {
    return null;
  }

  return (
    <>
      <div className="border-t border-muted px-3 py-4">
        <button
          type="button"
          onClick={() => setIsWebdavDialogOpen(true)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-muted-background"
        >
          <FontAwesomeIcon
            icon={faCircleInfo}
            className="h-4 w-4"
          />
          <span className="text-sm">{t('filesharing.webdavInfo.title')}</span>
        </button>

        <div className="my-3 border-t border-muted" />

        <div className="mb-1 flex items-center gap-2">
          <FontAwesomeIcon
            icon={faChartPie}
            className="h-3 w-3"
          />
          <p className="text-sm">{lmnUser?.school}</p>
        </div>
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-gray-300">
          <div
            className={cn('absolute left-0 top-0 h-full rounded-full transition-all', progressBarColor)}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs">
          {t('dashboard.quota.gbUsed', {
            used: quotaUsedInGb,
            total: quotaHardLimitInGb,
          })}
        </p>
      </div>

      <WebdavInfoDialog
        isOpen={isWebdavDialogOpen}
        handleClose={() => setIsWebdavDialogOpen(false)}
      />
    </>
  );
};

export default FileSharingMenuBarFooter;
