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
import SaveExternalFileDialog from '@/pages/FileSharing/Dialog/SaveExternalFileDialog';
import SaveExternalFileDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/SaveExternalFileDialogBody';
import saveExternalFileFormSchema from '@libs/filesharing/types/saveExternalFileFormSchema';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import buildTldrFileFromEditor from '@libs/tldraw-sync/utils/buildTldrFileFromEditor';
import useUserStore from '@/store/UserStore/useUserStore';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import { v4 as uuidv4 } from 'uuid';
import useFileSharingStore from '../FileSharing/useFileSharingStore';

const SaveTldrDialog: React.FC = () => {
  const { t } = useTranslation();

  const { updateFilesToUpload, uploadFiles } = useHandelUploadFileStore();
  const { eduApiToken } = useUserStore();
  const { editor, isDialogOpen, setIsDialogOpen } = useWhiteboardEditorStore();
  const { moveOrCopyItemToPath } = useFileSharingDialogStore();
  const selectedWebdavShare = useFileSharingStore((s) => s.selectedWebdavShare);

  const close = () => setIsDialogOpen(false);

  const buildTldrBlob = async (name: string): Promise<File> => {
    if (!editor) throw new Error('Editor not ready');
    const file = buildTldrFileFromEditor(editor, name);
    const text = await file.text();
    return new File([text], name, { type: RequestResponseContentType.APPLICATION_OCTET_STREAM });
  };

  const save = async (file: File | Blob) => {
    const targetDir = moveOrCopyItemToPath?.filePath || '';
    const name = (file as File)?.name && (file as File)?.name.trim() !== '' ? (file as File).name : 'untitled.tldr';
    const uploadFile: UploadFile = Object.assign(new File([file], name, { type: file.type }), {
      id: uuidv4(),
      isZippedFolder: false,
      originalFolderName: undefined,
      fileCount: undefined,
    });
    updateFilesToUpload(() => [uploadFile]);
    await uploadFiles(targetDir, eduApiToken, selectedWebdavShare);
    setIsDialogOpen(false);
  };

  return (
    <SaveExternalFileDialog
      isOpen={isDialogOpen}
      title={t('saveExternalFileDialogBody.saveExternalFile')}
      Body={SaveExternalFileDialogBody}
      schema={saveExternalFileFormSchema}
      defaultValues={{ filename: '' }}
      onClose={close}
      normalizeFilename={(raw) => (/\.tldr$/i.test(raw) ? raw : `${raw}.tldr`)}
      buildFile={buildTldrBlob}
      onSave={save}
    />
  );
};

export default SaveTldrDialog;
