import React, { useEffect } from 'react';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { FilesharingDialogProps } from '@libs/filesharing/types/filesharingDialogProps';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ContentType from '@libs/filesharing/types/contentType';

const CreateOrRenameContentDialogBody: React.FC<FilesharingDialogProps> = ({ form, isRenaming }) => {
  const { selectedItems } = useFileSharingStore();
  const filename = form.watch('filename');
  const extension = form.watch('extension');

  useEffect(() => {
    if (isRenaming && selectedItems.length === 1) {
      const { basename, type } = selectedItems[0];

      if (type === ContentType.FILE) {
        const dotIndex = basename.lastIndexOf('.');
        form.setValue('filename', dotIndex > 0 ? basename.substring(0, dotIndex) : basename);
        form.setValue('extension', dotIndex > 0 ? basename.substring(dotIndex) : '');
      } else {
        form.setValue('filename', basename);
        form.setValue('extension', '');
      }
    } else {
      form.setValue('filename', '');
      form.setValue('extension', '');
    }
  }, [isRenaming, selectedItems, form]);

  const showExtensionInput =
    isRenaming && extension && selectedItems.length === 1 && selectedItems[0].type === ContentType.FILE;

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
      </form>
    </Form>
  );
};

export default CreateOrRenameContentDialogBody;
