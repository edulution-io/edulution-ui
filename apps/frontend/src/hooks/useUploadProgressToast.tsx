/*
 * LICENSE
 * GNU Affero General Public License v3.0 or later
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import ProgressBox from '@/components/ui/ProgressBox';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import { useTranslation } from 'react-i18next';
import { DONE_TOAST_DURATION_MS, LIVE_TOAST_DURATION_MS } from '@libs/ui/constants/showToasterDuration';
import { useParams } from 'react-router-dom';

import formatTransferSpeed from '@libs/filesharing/utils/formatTransferSpeed';
import formatEstimatedTimeRemaining from '@libs/filesharing/utils/formatEstimatedTimeRemaining';
import { formatBytes } from '@/pages/FileSharing/utilities/filesharingUtilities';

const useUploadProgressToast = () => {
  const { webdavShare } = useParams();
  const { currentPath, fetchFiles } = useFileSharingStore();
  const { t } = useTranslation();

  const total = useHandelUploadFileStore((s) => s.totalPlanned);
  const done = useHandelUploadFileStore((s) => s.completedByName.size);
  const uploading = useHandelUploadFileStore((s) => s.uploadingByName.size);
  const progressByName = useHandelUploadFileStore((s) => s.progressByName);

  const TOAST_ID = 'upload:simple';
  const lastShownDone = useRef<number>(-1);
  const hasRefreshed = useRef<boolean>(false);

  const bytesSnap = useMemo(() => {
    const values = Object.values(progressByName ?? {});

    const loaded = values.reduce((a, p) => a + Math.max(0, Number(p?.loaded ?? 0)), 0);
    const totalBytes = values.reduce((a, p) => a + Math.max(0, Number(p?.total ?? 0)), 0);
    const speedSum = values.reduce((a, p) => a + Math.max(0, Number(p?.bytesPerSecond ?? p?.speedBps ?? 0)), 0);

    const remaining = Math.max(0, totalBytes - loaded);
    const etaSeconds = speedSum > 0 ? Math.ceil(remaining / speedSum) : undefined;

    return { loaded, totalBytes, speedSum, etaSeconds };
  }, [progressByName]);

  useEffect(() => {
    if (total === 0) return;

    const percent = Math.min(100, Math.round((done / total) * 100));
    const allDone = done >= total;
    if (done !== lastShownDone.current && allDone) {
      lastShownDone.current = done;
    }

    const title = allDone
      ? t('filesharing.progressBox.allUploadsComplete', { defaultValue: 'Uploads abgeschlossen' })
      : t('filesharing.progressBox.uploadingMultiple', { defaultValue: 'Uploads laufen' });

    const desc =
      `${done}/${total} ${t('filesharing.progressBox.files', { defaultValue: 'Dateien' })}` +
      `\n${formatBytes(bytesSnap.loaded)} / ${formatBytes(bytesSnap.totalBytes || 0)} ${formatTransferSpeed(bytesSnap.speedSum || 0)}\n${formatEstimatedTimeRemaining(bytesSnap.etaSeconds)}`;

    toast(
      <div className="whitespace-pre-wrap normal-case tabular-nums">
        <ProgressBox
          data={{
            id: TOAST_ID,
            percent,
            title,
            description: desc,
            processed: done,
            total,
          }}
        />
      </div>,
      { id: TOAST_ID, duration: allDone ? DONE_TOAST_DURATION_MS : LIVE_TOAST_DURATION_MS },
    );

    if (allDone && !hasRefreshed.current) {
      hasRefreshed.current = true;
      void fetchFiles(webdavShare, currentPath);
    }
  }, [total, done, uploading, bytesSnap, currentPath, fetchFiles, t]);
};

export default useUploadProgressToast;
