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

import React, { FC } from 'react';
import OnlyOfficeEditor from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditor';
import useOnlyOffice from '@/pages/FileSharing/hooks/useOnlyOffice';

interface OnlyOfficeProps {
  filePath: string;
  fileName: string;
  url: string;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
}

const OnlyOffice: FC<OnlyOfficeProps> = ({ url, filePath, fileName, mode, type }) => {
  const { documentServerURL, editorType, editorsConfig } = useOnlyOffice({
    filePath,
    fileName,
    url,
    type,
    mode,
  });

  return (
    editorsConfig && (
      <OnlyOfficeEditor
        documentServerURL={documentServerURL || ''}
        editorType={editorType}
        mode={mode}
        editorConfig={editorsConfig}
        filePath={filePath}
        fileName={fileName}
      />
    )
  );
};

export default OnlyOffice;
