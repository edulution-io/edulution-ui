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

interface FileHeaderProps {
  filename: string;
  creator: string;
}

const FileHeader: React.FC<FileHeaderProps> = ({ filename, creator }) => {
  const { t } = useTranslation();
  return (
    <>
      <header className="flex items-start gap-3">
        <p>{t('filesharing.publicFileSharing.nameOfContent')} </p>
        <p className="truncate text-background">{filename}</p>
      </header>

      <div className="mt-4 flex items-center gap-2 text-background">
        <p>{t('filesharing.publicFileSharing.sharedBy')} </p>
        <p className="truncate">{creator}</p>
      </div>
    </>
  );
};

export default FileHeader;
