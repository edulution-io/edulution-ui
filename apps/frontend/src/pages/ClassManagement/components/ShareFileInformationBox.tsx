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
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import Progress from '@/components/ui/Progress';
import { useTranslation } from 'react-i18next';

interface ShareFileInformationBoxProps {
  filesharingProgress: FilesharingProgressDto | null;
}

const ShareFileInformationBox: React.FC<ShareFileInformationBoxProps> = ({ filesharingProgress }) => {
  const { t } = useTranslation();

  if (!filesharingProgress) {
    return null;
  }

  const { processed, total, percent, currentFile, studentName } = filesharingProgress;

  return (
    <div className="flex flex-col gap-2 rounded border p-4 shadow">
      <h2 className="text-sm font-bold">{t('filesharing.progressBox.title')}</h2>

      <Progress value={percent} />

      <p className="text-sm text-background">
        {t('filesharing.progressBox.processedInfo', {
          processed,
          total,
        })}
      </p>

      <p className="text-sm text-background">
        {t('filesharing.progressBox.fileInfo', {
          filename: currentFile,
          studentName,
        })}
      </p>
    </div>
  );
};

export default ShareFileInformationBox;
