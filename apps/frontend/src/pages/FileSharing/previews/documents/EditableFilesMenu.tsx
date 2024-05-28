import React, { FC } from 'react';
import { DirectoryFile } from '@/datatypes/filesystem.ts';
import { MenubarMenu, MenubarTrigger } from '@/components/ui/MenubarSH.tsx';
import { MdFolder } from 'react-icons/md';
import { Menubar } from '@radix-ui/react-menubar';
import { useSearchParams } from 'react-router-dom';
import useFileEditorStore from './fileEditorStore.ts';

interface EditableFilesMenuProps {
  editableFiles: DirectoryFile[];
}

const EditableFilesMenu: FC<EditableFilesMenuProps> = ({ editableFiles }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { closeOnlyOfficeDocEditor } = useFileEditorStore();
  return (
    <Menubar className="flex w-full flex-row gap-4 overflow-x-scroll">
      <MenubarMenu>
        <div key={'home'}>
          <MenubarTrigger
            className="text-black"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('editFile');
              window.location.href = url.toString();
            }}
          >
            <MdFolder size={16} />
          </MenubarTrigger>
        </div>
        {editableFiles.map((file, index) => (
          <React.Fragment key={file.etag}>
            <MenubarTrigger
              className="text-black"
              onClick={() => {
                closeOnlyOfficeDocEditor();
                searchParams.set('editFile', file.basename);
                setSearchParams(searchParams);
              }}
            >
              <p className="text-sm">{file.basename}</p>
            </MenubarTrigger>
            {index < editableFiles.length - 1 && <div className="mx-2 h-full border-l border-gray-300"></div>}
          </React.Fragment>
        ))}
      </MenubarMenu>
    </Menubar>
  );
};

export default EditableFilesMenu;
