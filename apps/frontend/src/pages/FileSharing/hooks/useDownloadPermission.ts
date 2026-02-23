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

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import getBrowserDownloadHelpUrl from '@libs/common/utils/getBrowserDownloadHelpUrl';
import { LIVE_TOAST_DURATION_MS } from '@libs/ui/constants/showToasterDuration';
import useDownloadAcknowledgedStore from './useDownloadAcknowledgedStore';

const SINGLE_DOWNLOAD_TOAST_ID = 'single-download-info';
const MULTIPLE_DOWNLOAD_TOAST_ID = 'multiple-download-info';

const useDownloadPermission = () => {
  const { t } = useTranslation();
  const {
    isSingleDownloadAcknowledged,
    isMultipleDownloadAcknowledged,
    setSingleDownloadAcknowledged,
    setMultipleDownloadAcknowledged,
  } = useDownloadAcknowledgedStore();

  const handleHelpClick = useCallback(() => {
    window.open(getBrowserDownloadHelpUrl(), '_blank', 'noopener,noreferrer');
  }, []);

  const showDownloadToast = useCallback(
    (toastId: string, translationPrefix: string, onAcknowledge: (value: boolean) => void) => {
      toast.info(`${t(`${translationPrefix}.promptInfo`)}\n\n${t(`${translationPrefix}.downloadSucceeded`)}`, {
        id: toastId,
        position: 'top-right',
        duration: LIVE_TOAST_DURATION_MS,
        action: {
          label: t('common.yes'),
          onClick: () => {
            onAcknowledge(true);
            toast.dismiss(toastId);
          },
        },
        cancel: {
          label: t(`${translationPrefix}.help`),
          onClick: handleHelpClick,
        },
      });
    },
    [t, handleHelpClick],
  );

  const checkDownloadAllowed = useCallback(
    (fileCount: number): boolean => {
      if (fileCount <= 0) {
        return true;
      }

      if (fileCount === 1 && !isSingleDownloadAcknowledged) {
        showDownloadToast(SINGLE_DOWNLOAD_TOAST_ID, 'filesharing.singleDownload', setSingleDownloadAcknowledged);
      }

      if (fileCount > 1 && !isMultipleDownloadAcknowledged) {
        showDownloadToast(MULTIPLE_DOWNLOAD_TOAST_ID, 'filesharing.multipleDownload', setMultipleDownloadAcknowledged);
      }

      return true;
    },
    [
      isSingleDownloadAcknowledged,
      isMultipleDownloadAcknowledged,
      setSingleDownloadAcknowledged,
      setMultipleDownloadAcknowledged,
      showDownloadToast,
    ],
  );

  return { checkDownloadAllowed };
};

export default useDownloadPermission;
