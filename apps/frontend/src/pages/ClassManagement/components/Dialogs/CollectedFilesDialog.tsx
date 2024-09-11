import { t } from 'i18next';
import React, { useEffect } from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useUserStore from '@/store/UserStore/UserStore';
import buildBasePath from '@libs/filesharing/utils/buildBasePath';

interface CollectedFilesDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const CollectedFilesDialog: React.FC<CollectedFilesDialogProps> = ({ title, isOpen, onClose }) => {
  const getFooter = () => (
    <div className="mt-4 flex justify-between space-x-4">
      <button
        type="button"
        className="hover:ciRed rounded-md bg-ciLightRed px-4 py-2 text-foreground"
        onClick={onClose}
      >
        {t('classmanagement.deactivate')}
      </button>
    </div>
  );

  const getDialogBody = () => {
    const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
    const { fetchFiles, files } = useFileSharingStore();
    const { user } = useUserStore();

    const basePath = buildBasePath(user?.ldapGroups.roles[0], user?.ldapGroups.classes[0]);
    useEffect(() => {
      void fetchFiles(`${basePath}/${user?.username}/transfer/collected`);
    }, []);

    const renderTableRow = (row: DirectoryFileDTO) => (
      <TableRow
        key={row.filename}
        onClick={(e) => {
          e.preventDefault();
          setMoveOrCopyItemToPath(row);
        }}
      >
        <TableCell
          className={moveOrCopyItemToPath.basename === row.basename ? 'bg-ciLightBlue text-black' : 'text-black'}
        >
          <div className="flex w-full items-center justify-between">
            <div className="max-w-[200px] truncate">{row.basename}</div>
            {/* Apply truncation */}
          </div>
        </TableCell>
      </TableRow>
    );

    const renderTable = () => (
      <ScrollArea className="h-[200px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">{t('moveItemDialog.folderName')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{files.map(renderTableRow)}</TableBody>
        </Table>
      </ScrollArea>
    );

    return <ScrollArea className="h-[200px]">{renderTable()}</ScrollArea>;
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CollectedFilesDialog;
