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
