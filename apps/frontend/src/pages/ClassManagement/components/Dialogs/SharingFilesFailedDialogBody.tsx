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
import ItemDialogList from '@/components/shared/ItemDialogList';
import { Button } from '@/components/shared/Button';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';

interface SharingFilesFailedDialogBodyProps {
  failedFile: string;
  affectedUsers: string[];
  failedPaths: string[];
}

const SharingFilesFailedDialogBody: React.FC<SharingFilesFailedDialogBodyProps> = ({
  failedFile,
  affectedUsers,
  failedPaths,
}) => {
  const { t } = useTranslation();

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const failedFileName = failedFile.split('/').pop() || '';
  const possibleNewFileName = `${failedFileName}_${day}_${month}_${minute}_${second}`;

  const { shareFiles } = useLessonStore();

  return (
    <div className="flex flex-col gap-3">
      <ul className="list-disc pl-4 text-left">
        <li>{t('classmanagement.failDialog.reasonMissing')}</li>
        <li>{t('classmanagement.failDialog.reasonAlreadyReceived')}</li>
        <li>{t('classmanagement.failDialog.reasonDuplicate')}</li>
      </ul>

      <p className="text-sm text-background">{t('classmanagement.failDialog.affectedPersons')}</p>
      <ItemDialogList items={affectedUsers.map((user) => ({ name: user, id: user }))} />

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
            await shareFiles({
              originFilePath: failedFile,
              destinationFilePaths: failedPaths.map((path) => {
                const parts = path.split('/');
                parts.pop();
                const pathWithoutLast = parts.join('/');
                return `${pathWithoutLast}/${possibleNewFileName}`;
              }),
            } as DuplicateFileRequestDto);
          }}
        >
          {t('classmanagement.failDialog.retryButton')}
        </Button>
      </div>
    </div>
  );
};

export default SharingFilesFailedDialogBody;
