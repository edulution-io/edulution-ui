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

import OnlyOfficeConfig from '@libs/filesharing/types/OnlyOfficeConfig';
import OFFICE_DOCUMENT_TYPES from '@libs/filesharing/constants/officeDocumentTypes';

const findDocumentsEditorType = (fileType: string): OnlyOfficeConfig => {
  switch (fileType) {
    case OFFICE_DOCUMENT_TYPES.DOC:
    case OFFICE_DOCUMENT_TYPES.DOCX:
    case OFFICE_DOCUMENT_TYPES.ODT:
    case OFFICE_DOCUMENT_TYPES.DOT:
    case OFFICE_DOCUMENT_TYPES.DOTX:
    case OFFICE_DOCUMENT_TYPES.OTT:
    case OFFICE_DOCUMENT_TYPES.RTF:
      return { id: 'docxEditor', key: `${OFFICE_DOCUMENT_TYPES.DOCX}${Math.random() * 100}`, documentType: 'word' };

    case OFFICE_DOCUMENT_TYPES.XLSX:
    case OFFICE_DOCUMENT_TYPES.XLS:
    case OFFICE_DOCUMENT_TYPES.XLT:
    case OFFICE_DOCUMENT_TYPES.XLTX:
    case OFFICE_DOCUMENT_TYPES.ODS:
    case OFFICE_DOCUMENT_TYPES.OTS:
      return { id: 'xlsxEditor', key: `${OFFICE_DOCUMENT_TYPES.XLSX}${Math.random() * 100}`, documentType: 'cell' };

    case OFFICE_DOCUMENT_TYPES.PPTX:
    case OFFICE_DOCUMENT_TYPES.PPSX:
    case OFFICE_DOCUMENT_TYPES.POTX:
    case OFFICE_DOCUMENT_TYPES.PPT:
    case OFFICE_DOCUMENT_TYPES.PPS:
    case OFFICE_DOCUMENT_TYPES.POT:
    case OFFICE_DOCUMENT_TYPES.OTP:
    case OFFICE_DOCUMENT_TYPES.ODP:
      return { id: 'pptxEditor', key: `${OFFICE_DOCUMENT_TYPES.PPTX}${Math.random() * 100}`, documentType: 'slide' };

    default:
      return { id: 'docxEditor', key: `unknown${Math.random() * 100}`, documentType: 'word' };
  }
};

export default findDocumentsEditorType;
