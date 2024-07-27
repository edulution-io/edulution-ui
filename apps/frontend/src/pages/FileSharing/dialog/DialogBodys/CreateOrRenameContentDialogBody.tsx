import React, { useEffect, useState } from 'react';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { FilesharingDialogProps } from '@libs/filesharing/types/filesharingDialogProps';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';

const CreateOrRenameContentDialogBody: React.FC<FilesharingDialogProps> = ({ form, isRenaming }) => {
  const { selectedItems } = useFileSharingStore();
  const [filename, setFilename] = useState('');
  const [extension, setExtension] = useState('');

  useEffect(() => {
    if (isRenaming && selectedItems.length === 1) {
      const { basename } = selectedItems[0];
      const dotIndex = basename.lastIndexOf('.');
      const name = dotIndex > 0 ? basename.substring(0, dotIndex) : basename;
      const ext = dotIndex > 0 ? basename.substring(dotIndex) : '';
      setFilename(name);
      setExtension(ext);
      form.setValue('extension', ext);
    } else {
      setFilename('');
      setExtension('');
    }
  }, [isRenaming, selectedItems]);

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className={isRenaming && extension ? 'flex w-full' : ''}>
          <div className="flex-grow">
            <FormField
              name="filename"
              form={form}
              labelTranslationId=""
              isLoading={false}
              variant="default"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>
          {isRenaming && extension && (
            <div className="w-1/16">
              <FormField
                name="extension"
                form={form}
                labelTranslationId=""
                isLoading={false}
                variant="default"
                value={extension}
                readonly
              />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CreateOrRenameContentDialogBody;
