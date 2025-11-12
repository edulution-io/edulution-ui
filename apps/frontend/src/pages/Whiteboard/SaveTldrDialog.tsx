/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
