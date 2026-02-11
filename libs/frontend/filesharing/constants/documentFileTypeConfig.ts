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

import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';
import EXTENSION_ICON_MAP from '@libs/frontend/filesharing/constants/extensionIconMap';

const DOCUMENT_FILE_TYPE_CONFIG: { fileType: TAvailableFileTypes; icon: IconDefinition; iconColor: string }[] = [
  { fileType: AVAILABLE_FILE_TYPES.drawIoFile, ...EXTENSION_ICON_MAP['drawio'] },
  { fileType: AVAILABLE_FILE_TYPES.textFile, ...EXTENSION_ICON_MAP['txt'] },
  { fileType: AVAILABLE_FILE_TYPES.documentFile, ...EXTENSION_ICON_MAP['docx'] },
  { fileType: AVAILABLE_FILE_TYPES.spreadsheetFile, ...EXTENSION_ICON_MAP['xlsx'] },
  { fileType: AVAILABLE_FILE_TYPES.presentationFile, ...EXTENSION_ICON_MAP['pptx'] },
];

export default DOCUMENT_FILE_TYPE_CONFIG;
