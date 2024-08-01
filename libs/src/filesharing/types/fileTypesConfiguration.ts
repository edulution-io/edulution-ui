import { t } from 'i18next';
import { SiDiagramsdotnet } from 'react-icons/si';
import { FaFileAlt, FaFileExcel, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import { DropdownOption } from '@libs/filesharing/types/fileCreationDropDownOptions';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/types/availableFileTypes';

const FileTypesConfiguration: DropdownOption[] = [
  {
    extension: '.drawio',
    type: AVAILABLE_FILE_TYPES.drawIo,
    name: t(AVAILABLE_FILE_TYPES.drawIo.type),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.drawIo.type}`),
    icon: SiDiagramsdotnet,
    iconColor: 'orange',
  },
  {
    extension: '.txt',
    type: AVAILABLE_FILE_TYPES.text,
    name: t(AVAILABLE_FILE_TYPES.text.type),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.text.type}`),
    icon: FaFileAlt,
    iconColor: 'black',
  },
  {
    extension: '.docx',
    type: AVAILABLE_FILE_TYPES.document,
    name: t(AVAILABLE_FILE_TYPES.document.type),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.document.type}`),
    icon: FaFileWord,
    iconColor: 'blue',
  },
  {
    extension: '.xlsx',
    type: AVAILABLE_FILE_TYPES.spreadsheet,
    name: t(AVAILABLE_FILE_TYPES.spreadsheet.type),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.spreadsheet.type}`),
    icon: FaFileExcel,
    iconColor: 'green',
  },
  {
    extension: '.pptx',
    type: AVAILABLE_FILE_TYPES.presentation,
    name: t(AVAILABLE_FILE_TYPES.presentation.type),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.presentation.type}`),
    icon: FaFilePowerpoint,
    iconColor: '#ec4f03',
  },
];
export default FileTypesConfiguration;
