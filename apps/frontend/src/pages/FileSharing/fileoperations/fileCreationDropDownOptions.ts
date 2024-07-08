import { t } from 'i18next';
import { SiDiagramsdotnet } from 'react-icons/si';
import { FaFileAlt, FaFileExcel, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import React from 'react';

export const AVAILABLE_FILE_TYPES = {
  drawIo: {
    type: 'drawIoFile',
    extension: '.drawio',
    generate: 'drawio',
  },
  text: {
    type: 'textFile',
    extension: '.txt',
    generate: 'txt',
  },
  document: {
    type: 'documentFile',
    extension: '.docx',
    generate: 'docx',
  },
  spreadsheet: {
    type: 'spreadsheetFile',
    extension: '.xlsx',
    generate: 'xlsx',
  },
  presentation: {
    type: 'presentationFile',
    extension: '.pptx',
    generate: 'pptx',
  },
} as const;

export type FileTypeKey = keyof typeof AVAILABLE_FILE_TYPES;

export interface DropdownOption {
  extension: string;
  name: string;
  type: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey];
  title: string;
  icon: React.ElementType;
  iconColor?: string;
}

const FILE_TYPES: DropdownOption[] = [
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

export default FILE_TYPES;
