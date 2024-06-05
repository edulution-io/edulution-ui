import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH.tsx';
import React, { FC, useState } from 'react';
import { t } from 'i18next';
import { ContentType } from '@/datatypes/filesystem.ts';
import { SiDiagramsdotnet } from 'react-icons/si';
import { FaFileAlt, FaFileExcel, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import CreateNewContentDialog from '@/pages/FileSharing/dialog/CreateNewContentDialog.tsx';

interface ChooseNewFileTypeProps {
  trigger: React.ReactNode;
  contentType: ContentType;
}

interface DropdownEntryProps {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
  textColor: string;
}

const DropDownEntry: FC<DropdownEntryProps> = ({ text, icon, onClick, style, textColor }) => (
  <DropdownMenuItem
    onClick={onClick}
    style={style}
  >
    <div className="flex flex-row items-center gap-2 hover:bg-blue-300">
      <div style={{ color: textColor }}>{icon}</div>
      {text}
    </div>
  </DropdownMenuItem>
);

const ChooseNewFileType: FC<ChooseNewFileTypeProps> = ({ trigger, contentType }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileType, setFileType] = useState<{ extension: string; name: string; title: string }>({
    extension: '',
    name: '',
    title: '',
  });

  const handleOpenDialog = (extension: string, name: string, title: string) => {
    setFileType({ extension, name, title });
    setIsDialogOpen(true);
  };
  enum AVAILABLE_FILE_TYPES {
    drawIo = 'drawIoFile',
    text = 'textFile',
    document = 'documentFile',
    spreadsheet = 'spreadsheetFile',
    presentation = 'presentationFile',
  }

  const FILE_TYPES = [
    { extension: '.drawio', name: t(AVAILABLE_FILE_TYPES.drawIo), title: t(`filetype.${AVAILABLE_FILE_TYPES.drawIo}`) },
    { extension: '.txt', name: t(AVAILABLE_FILE_TYPES.text), title: t(`filetype.${AVAILABLE_FILE_TYPES.text}`) },
    {
      extension: '.docx',
      name: t(AVAILABLE_FILE_TYPES.document),
      title: t(`filetype.${AVAILABLE_FILE_TYPES.document}`),
    },
    {
      extension: '.xlsx',
      name: t(AVAILABLE_FILE_TYPES.spreadsheet),
      title: t(`filetype.${AVAILABLE_FILE_TYPES.spreadsheet}`),
    },
    {
      extension: '.pptx',
      name: t(AVAILABLE_FILE_TYPES.presentation),
      title: t(`filetype.${AVAILABLE_FILE_TYPES.presentation}`),
    },
  ];

  return (
    <div className="flex cursor-pointer items-center justify-end gap-4 px-4 py-2 md:block md:px-2">
      <DropdownMenuSH>
        <DropdownMenuTrigger className="flex items-center gap-1">{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="z-50 bg-white text-black"
        >
          {FILE_TYPES.map(({ extension, name, title }) => (
            <DropDownEntry
              key={extension}
              text={t(`fileCreateNewContent.${name.replace(' ', '').toLowerCase()}`)}
              icon={
                {
                  '.drawio': <SiDiagramsdotnet />,
                  '.txt': <FaFileAlt />,
                  '.docx': <FaFileWord />,
                  '.xlsx': <FaFileExcel />,
                  '.pptx': <FaFilePowerpoint />,
                }[extension]
              }
              onClick={() => handleOpenDialog(extension, name, title)}
              style={{ backgroundColor: '#f0f0f0' }}
              textColor={
                {
                  '.drawio': 'orange',
                  '.txt': 'black',
                  '.docx': 'blue',
                  '.xlsx': 'green',
                  '.pptx': '#ec4f03',
                  default: 'black',
                }[extension] || 'default'
              }
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenuSH>

      <CreateNewContentDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        contentType={contentType}
        fileType={fileType.extension}
        fileTypeName={fileType.title}
      />
    </div>
  );
};

export default ChooseNewFileType;
