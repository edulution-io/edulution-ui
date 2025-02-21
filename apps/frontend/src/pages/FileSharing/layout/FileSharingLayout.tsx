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

import React, { useEffect, useMemo } from 'react';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import FileViewer from '@/pages/FileSharing/previews/FileViewer';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import isFileValid from '@libs/filesharing/utils/isFileValid';
import useIsMobileView from '@/hooks/useIsMobileView';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';

interface FileSharingLayoutProps {
  files: DirectoryFileDTO[];
}

const FileSharingLayout: React.FC<FileSharingLayoutProps> = () => {
  const isMobileView = useIsMobileView();
  const { setShowEditor, showEditor } = useFileEditorStore();
  const { currentlyEditingFile } = useFileSharingStore();
  const { appConfigs } = useAppConfigsStore();

  const documentServerURL = useMemo(
    () => getExtendedOptionsValue(appConfigs, APPS.FILE_SHARING, ExtendedOptionKeys.ONLY_OFFICE_URL),
    [appConfigs],
  );

  const isValidFile = useMemo(
    () => currentlyEditingFile && currentlyEditingFile.type === ContentType.FILE && isFileValid(currentlyEditingFile),
    [currentlyEditingFile],
  );

  const shouldShowEditor = showEditor && isValidFile && documentServerURL !== '' && !isMobileView;

  useEffect(() => {
    if (currentlyEditingFile) {
      setShowEditor(true);
    }
  }, [currentlyEditingFile, setShowEditor]);

  return (
    <div className="flex flex-row">
      <div className={shouldShowEditor ? 'w-1/2 2xl:w-2/3' : 'w-full'}>
        <FileSharingTable />
      </div>
      {shouldShowEditor && (
        <div
          className="w-1/2 2xl:w-1/3"
          data-testid="test-id-file-preview"
        >
          <FileViewer editMode={false} />
        </div>
      )}
    </div>
  );
};

export default FileSharingLayout;
