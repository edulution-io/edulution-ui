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

import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SaveExternalFileDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/SaveExternalFileDialogBody';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import { useForm } from 'react-hook-form';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import React from 'react';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import buildTldrFileFromEditor from '@libs/tldraw-sync/utils/buildTldrFileFromEditor';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useUserStore from '@/store/UserStore/useUserStore';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import { zodResolver } from '@hookform/resolvers/zod';
import saveExternalFileFormSchema from '@libs/filesharing/types/saveExternalFileFormSchema';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { useTranslation } from 'react-i18next';

const SaveExternalFileDialog = () => {
  const { isTldrDialogOpen, setUploadTldrDialogOpen, setFilesToUpload, uploadFiles } = useHandelUploadFileStore();
  const { editor } = useWhiteboardEditorStore();
  const { moveOrCopyItemToPath } = useFileSharingDialogStore();

  const { eduApiToken } = useUserStore();

  const { t } = useTranslation();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(saveExternalFileFormSchema),
    defaultValues: { filename: '' },
  });

  const { isValid } = form.formState;

  const handleClose = () => {
    setUploadTldrDialogOpen(false);
    setFilesToUpload([]);
    form.reset();
  };

  const handelSubmit = async () => {
    if (!editor) return;
    const filename = form.getValues('filename');
    const raw = (filename ?? '').trim();
    if (!raw) return;
    const name = /\.tldr$/i.test(raw) ? raw : `${raw}.tldr`;

    const targetDir = getPathWithoutWebdav(moveOrCopyItemToPath?.filePath || '');
    const file = buildTldrFileFromEditor(editor, name);
    const octet = new File([await file.text()], file.name, {
      type: RequestResponseContentType.APPLICATION_OCTET_STREAM,
    });
    setFilesToUpload([octet as UploadFile]);
    await uploadFiles(targetDir, eduApiToken);
    setUploadTldrDialogOpen(false);
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handelSubmit}
      submitButtonText="common.save"
      submitButtonType="submit"
      disableSubmit={!isValid}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isTldrDialogOpen}
      title={t('saveExternalFileDialogBody.saveExternalFile')}
      body={<SaveExternalFileDialogBody form={form} />}
      footer={getFooter()}
      handleOpenChange={() => setUploadTldrDialogOpen(!isTldrDialogOpen)}
    />
  );
};

export default SaveExternalFileDialog;
