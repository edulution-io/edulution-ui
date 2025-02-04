import { t } from 'i18next';
import { SiDiagramsdotnet } from 'react-icons/si';
import { FaFileAlt, FaFileExcel, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import { DropdownOption } from '@libs/filesharing/types/fileCreationDropDownOptions';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';

const FileTypesConfiguration: DropdownOption[] = [
  {
    type: AVAILABLE_FILE_TYPES.drawIoFile,
    name: t(AVAILABLE_FILE_TYPES.drawIoFile),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.drawIoFile}`),
    icon: SiDiagramsdotnet,
    iconColor: 'orange',
  },
  {
    type: AVAILABLE_FILE_TYPES.textFile,
    name: t(AVAILABLE_FILE_TYPES.textFile),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.textFile}`),
    icon: FaFileAlt,
    iconColor: 'black',
  },
  {
    type: AVAILABLE_FILE_TYPES.documentFile,
    name: t(AVAILABLE_FILE_TYPES.documentFile),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.documentFile}`),
    icon: FaFileWord,
    iconColor: 'blue',
  },
  {
    type: AVAILABLE_FILE_TYPES.spreadsheetFile,
    name: t(AVAILABLE_FILE_TYPES.spreadsheetFile),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.spreadsheetFile}`),
    icon: FaFileExcel,
    iconColor: 'green',
  },
  {
    type: AVAILABLE_FILE_TYPES.presentationFile,
    name: t(AVAILABLE_FILE_TYPES.presentationFile),
    title: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.presentationFile}`),
    icon: FaFilePowerpoint,
    iconColor: '#ec4f03',
  },
];
export default FileTypesConfiguration;
