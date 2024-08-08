import React, { useEffect } from 'react';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import FileViewer from '@/pages/FileSharing/previews/FileViewer';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useIsMidSizeView from '@/hooks/useIsMidSizeView';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/fileEditorStore';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import { appExtendedOptions, AvailableAppExtendedOptions } from '@libs/appconfig/types/appExtendedType';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';

interface FileSharingLayoutProps {
  files: DirectoryFileDTO[];
}

const FileSharingLayout: React.FC<FileSharingLayoutProps> = ({ files }) => {
  const isMidSizeView = useIsMidSizeView();
  const { setShowEditor, showEditor } = useFileEditorStore();
  const { currentlyEditingFile } = useFileSharingStore();
  const { appConfigs } = useAppConfigsStore();
  const documentServerURL = getExtendedOptionValue(
    appConfigs,
    appExtendedOptions,
    AvailableAppExtendedOptions.ONLY_OFFICE_URL,
  );
  useEffect(() => {
    setShowEditor(true);
  }, [currentlyEditingFile]);

  useEffect(() => {}, []);

  return (
    <div className="flex flex-row">
      <div
        className={`${showEditor && !isMidSizeView && currentlyEditingFile && currentlyEditingFile.type === ContentType.FILE && documentServerURL !== '' ? 'w-full md:w-1/2 lg:w-2/3' : 'w-full'}`}
      >
        <FileSharingTable
          columns={FileSharingTableColumns}
          data={files}
        />
      </div>
      {currentlyEditingFile &&
        currentlyEditingFile.type === ContentType.FILE &&
        documentServerURL !== '' &&
        !isMidSizeView && (
          <div
            className="w-full md:w-1/2 lg:w-1/3"
            data-testid="test-id-file-preview"
          >
            {showEditor && (
              <FileViewer
                mode="view"
                editWindow={false}
              />
            )}
          </div>
        )}
    </div>
  );
};

export default FileSharingLayout;
