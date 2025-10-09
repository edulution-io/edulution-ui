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

import React, { useEffect } from 'react';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { FilesharingDialogProps } from '@libs/filesharing/types/filesharingDialogProps';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ContentType from '@libs/filesharing/types/contentType';
import { useTranslation } from 'react-i18next';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import generateFile from '@/pages/FileSharing/utilities/generateFile';
import getDocumentVendor from '@libs/filesharing/utils/getDocumentVendor';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';

const CreateOrRenameContentDialogBody: React.FC<FilesharingDialogProps> = ({ form, isRenaming }) => {
  const { selectedItems, files } = useFileSharingStore();
  const { selectedFileType, setSubmitButtonIsDisabled } = useFileSharingDialogStore();
  const { appConfigs } = useAppConfigsStore();
  const documentVendor = getDocumentVendor(appConfigs);
  const { t } = useTranslation();
  const filename = form.watch('filename')?.trim() || '';
  const extension = form.watch('extension')?.trim() || '';

  useEffect(() => {
    if (isRenaming && selectedItems.length === 1) {
      if (selectedItems[0].type === ContentType.FILE) {
        const dotIndex = selectedItems[0].filename.lastIndexOf('.');
        const base = dotIndex > 0 ? selectedItems[0].filename.substring(0, dotIndex) : selectedItems[0].filename;
        const ext = dotIndex > 0 ? selectedItems[0].filename.substring(dotIndex) : '';
        form.setValue('filename', base.trim());
        form.setValue('extension', ext.trim());
      } else {
        form.setValue('filename', selectedItems[0].filename.trim());
        form.setValue('extension', '');
      }
    } else {
      form.setValue('filename', '');
      form.setValue('extension', '');
    }
  }, [isRenaming, selectedItems, form]);

  const showExtensionInput =
    isRenaming && extension && selectedItems.length === 1 && selectedItems[0].type === ContentType.FILE;

  const [filenameAlreadyExists, setFilenameAlreadyExists] = React.useState(false);

  useEffect(() => {
    const checkIfFilenameAlreadyExists = async () => {
      if (!filename) return;
      let alreadyExists: boolean;

      if (selectedFileType) {
        const generatedFilename = await generateFile(selectedFileType, filename, documentVendor, true);
        alreadyExists = files.some((file) => file.filename === `${filename}.${generatedFilename.extension}`);
      } else {
        alreadyExists = files.some((file) => file.filename === filename + (extension || ''));
      }

      setFilenameAlreadyExists(alreadyExists);
      setSubmitButtonIsDisabled(alreadyExists || filename.length === 0);
    };

    void checkIfFilenameAlreadyExists();
  }, [files, selectedFileType, filename, documentVendor, extension, setSubmitButtonIsDisabled]);

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={showExtensionInput ? 'flex w-full items-center' : ''}>
          {filename !== undefined && (
            <div className="flex-grow">
              <FormField
                defaultValue={filename}
                name="filename"
                form={form}
                labelTranslationId=""
                variant="dialog"
              />
            </div>
          )}
          {showExtensionInput && (
            <div className="w-16 pl-2 text-center">
              <FormField
                defaultValue={extension}
                name="extension"
                form={form}
                labelTranslationId=""
                variant="dialog"
              />
            </div>
          )}
        </div>
        {filenameAlreadyExists && (
          <div>{t(`filesharing.${selectedFileType || extension ? 'file' : 'folder'}WithSameNameAlreadyExists`)}</div>
        )}
      </form>
    </Form>
  );
};

export default CreateOrRenameContentDialogBody;
