/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { IconType } from 'react-icons';
import { SiDiagramsdotnet } from 'react-icons/si';
import { FaFileAlt, FaFileExcel, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';

const DOCUMENT_FILE_TYPE_CONFIG: { fileType: TAvailableFileTypes; icon: IconType; iconColor: string }[] = [
  { fileType: AVAILABLE_FILE_TYPES.drawIoFile, icon: SiDiagramsdotnet, iconColor: 'orange' },
  { fileType: AVAILABLE_FILE_TYPES.textFile, icon: FaFileAlt, iconColor: 'black' },
  { fileType: AVAILABLE_FILE_TYPES.documentFile, icon: FaFileWord, iconColor: 'blue' },
  { fileType: AVAILABLE_FILE_TYPES.spreadsheetFile, icon: FaFileExcel, iconColor: 'green' },
  { fileType: AVAILABLE_FILE_TYPES.presentationFile, icon: FaFilePowerpoint, iconColor: '#ec4f03' },
];

export default DOCUMENT_FILE_TYPE_CONFIG;
