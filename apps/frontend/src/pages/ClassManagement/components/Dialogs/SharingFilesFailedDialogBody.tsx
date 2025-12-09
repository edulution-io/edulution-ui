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
import ItemList from '@/components/shared/ItemList';
import { Button } from '@/components/shared/Button';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';

interface SharingFilesFailedDialogBodyProps {
  failedFilePath: string;
  affectedUsers: string[];
  failedPaths: string[];
}

const SharingFilesFailedDialogBody: React.FC<SharingFilesFailedDialogBodyProps> = ({
  failedFilePath,
  affectedUsers,
  failedPaths,
}) => {
  const { t } = useTranslation();
  const selectedWebdavShare = useFileSharingStore((s) => s.selectedWebdavShare);

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const failedFileName = failedFilePath.split('/').pop() || '';
  const possibleNewFileName = `${failedFileName}_${day}_${month}_${minute}_${second}`;

  const { shareFiles } = useLessonStore();

  return (
    <div className="flex flex-col gap-3">
      <ul className="list-disc pl-4 text-left">
        <li>{t('classmanagement.failDialog.reasonMissing')}</li>
        <li>{t('classmanagement.failDialog.reasonAlreadyReceived')}</li>
        <li>{t('classmanagement.failDialog.reasonDuplicate')}</li>
      </ul>

      <p className="text-sm text-background">
        {affectedUsers.length > 1
          ? t('classmanagement.failDialog.affectedPersons')
          : t('classmanagement.failDialog.affectedPerson')}
      </p>
      <ItemList items={affectedUsers.map((user) => ({ name: user, id: user }))} />

      <p>
        {t('classmanagement.failDialog.filenameAdvice', {
          filename: possibleNewFileName,
        })}
      </p>

      <div className="flex justify-end">
        <Button
          variant="btn-small"
          className="bg-primary"
          onClick={async () => {
            await shareFiles(
              {
                originFilePath: failedFilePath,
                destinationFilePaths: failedPaths.map((path) => {
                  const parts = path.split('/');
                  parts.pop();
                  const pathWithoutLast = parts.join('/');
                  return `${pathWithoutLast}/${possibleNewFileName}`;
                }),
              },
              selectedWebdavShare,
            );
          }}
        >
          {t('classmanagement.failDialog.retryButton')}
        </Button>
      </div>
    </div>
  );
};

export default SharingFilesFailedDialogBody;
