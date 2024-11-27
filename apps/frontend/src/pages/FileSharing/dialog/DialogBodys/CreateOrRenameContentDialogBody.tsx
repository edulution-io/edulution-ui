import React, { useState } from 'react';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { FilesharingDialogProps } from '@libs/filesharing/types/filesharingDialogProps';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import Input from '@/components/shared/Input';
import ContentType from '@libs/filesharing/types/contentType';

const CreateOrRenameContentDialogBody: React.FC<FilesharingDialogProps> = ({ form, isRenaming }) => {
  const { selectedItems } = useFileSharingStore();

  const initializeState = () => {
    if (isRenaming && selectedItems.length === 1) {
      const { basename, type } = selectedItems[0];
      if (type === ContentType.FILE) {
        const dotIndex = basename.lastIndexOf('.');
        const name = dotIndex > 0 ? basename.substring(0, dotIndex) : basename;
        const ext = dotIndex > 0 ? basename.substring(dotIndex) : '';
        form.setValue('extension', ext);
        return { filename: name, extension: ext };
      }
      return { filename: basename, extension: '' };
    }
    return { filename: '', extension: '' };
  };

  const { filename: initialFilename, extension: initialExtension } = initializeState();
  const [filename, setFilename] = useState(initialFilename);
  const [extension] = useState(initialExtension);

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div
          className={
            isRenaming && extension && selectedItems[0].type === ContentType.FILE ? 'flex w-full items-center' : ''
          }
        >
          <div className="flex-grow">
            <FormField
              name="filename"
              form={form}
              labelTranslationId=""
              disabled={false}
              variant="default"
              value={filename}
              onChange={(e) => setFilename((e as React.ChangeEvent<HTMLInputElement>).target.value)}
            />
          </div>
          {isRenaming && extension && selectedItems[0].type === ContentType.FILE && (
            <div className="w-16 pt-2 text-center">
              <Input
                type="text"
                value={extension}
                variant="default"
                onChange={(e) => e.preventDefault()}
              />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CreateOrRenameContentDialogBody;
