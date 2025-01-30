import React, { useEffect, useMemo } from 'react';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import FileViewer from '@/pages/FileSharing/previews/FileViewer';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import isValidFile from '@libs/filesharing/utils/isValidFile';
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

  const validFile = useMemo(
    () => currentlyEditingFile && currentlyEditingFile.type === ContentType.FILE && isValidFile(currentlyEditingFile),
    [currentlyEditingFile],
  );

  const shouldShowEditor = showEditor && validFile && documentServerURL !== '' && !isMobileView;

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
