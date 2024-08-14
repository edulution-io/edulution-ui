import React, { useEffect, useMemo } from 'react';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import FileViewer from '@/pages/FileSharing/previews/FileViewer';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useIsMidSizeView from '@/hooks/useIsMidSizeView';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import isValidFile from '@libs/filesharing/utils/isValidFile';
import useIsMobileView from '@/hooks/useIsMobileView';
import {
  appExtendedOnyOfficeOptions,
  AppOnlyOfficeExtendedOptions,
} from '@libs/appconfig/constants/filesharing/appExtendedOnlyOfficeType';

interface FileSharingLayoutProps {
  files: DirectoryFileDTO[];
}

const FileSharingLayout: React.FC<FileSharingLayoutProps> = ({ files }) => {
  const isMidSizeView = useIsMidSizeView();
  const isMobileView = useIsMobileView();
  const { setShowEditor, showEditor } = useFileEditorStore();
  const { currentlyEditingFile } = useFileSharingStore();
  const { appConfigs } = useAppConfigsStore();

  const documentServerURL = useMemo(
    () => getExtendedOptionValue(appConfigs, appExtendedOnyOfficeOptions, AppOnlyOfficeExtendedOptions.ONLY_OFFICE_URL),
    [appConfigs],
  );

  const validFile = useMemo(
    () => currentlyEditingFile && currentlyEditingFile.type === ContentType.FILE && isValidFile(currentlyEditingFile),
    [currentlyEditingFile],
  );

  const shouldShowEditor = showEditor && !isMidSizeView && validFile && documentServerURL !== '' && !isMobileView;

  useEffect(() => {
    if (currentlyEditingFile) {
      setShowEditor(true);
    }
  }, [currentlyEditingFile, setShowEditor]);

  return (
    <div className="flex flex-row">
      <div className={shouldShowEditor ? 'w-full md:w-1/2 lg:w-2/3' : 'w-full'}>
        <FileSharingTable
          columns={FileSharingTableColumns}
          data={files}
        />
      </div>
      {shouldShowEditor && (
        <div
          className="w-full md:w-1/2 lg:w-1/3"
          data-testid="test-id-file-preview"
        >
          <FileViewer
            mode="view"
            editWindow={false}
          />
        </div>
      )}
    </div>
  );
};

export default FileSharingLayout;
