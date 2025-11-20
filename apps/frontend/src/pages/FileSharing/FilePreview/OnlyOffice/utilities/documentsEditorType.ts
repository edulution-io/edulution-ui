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
import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';

const findDocumentsEditorType = (fileType: string): OnlyOfficeConfig => {
  switch (fileType) {
    case OnlyOfficeDocumentTypes.DOC:
    case OnlyOfficeDocumentTypes.DOCX:
    case OnlyOfficeDocumentTypes.ODT:
    case OnlyOfficeDocumentTypes.DOT:
    case OnlyOfficeDocumentTypes.DOTX:
    case OnlyOfficeDocumentTypes.OTT:
    case OnlyOfficeDocumentTypes.RTF:
    case OnlyOfficeDocumentTypes.TXT:
    case OnlyOfficeDocumentTypes.XML:
    case OnlyOfficeDocumentTypes.HTML:
      return { id: 'docxEditor', key: `${OnlyOfficeDocumentTypes.DOCX}${Math.random() * 100}`, documentType: 'word' };

    case OnlyOfficeDocumentTypes.XLSX:
    case OnlyOfficeDocumentTypes.XLS:
    case OnlyOfficeDocumentTypes.XLT:
    case OnlyOfficeDocumentTypes.XLTX:
    case OnlyOfficeDocumentTypes.ODS:
    case OnlyOfficeDocumentTypes.OTS:
    case OnlyOfficeDocumentTypes.CSV:
      return { id: 'xlsxEditor', key: `${OnlyOfficeDocumentTypes.XLSX}${Math.random() * 100}`, documentType: 'cell' };

    case OnlyOfficeDocumentTypes.PPTX:
    case OnlyOfficeDocumentTypes.PPSX:
    case OnlyOfficeDocumentTypes.POTX:
    case OnlyOfficeDocumentTypes.PPT:
    case OnlyOfficeDocumentTypes.PPS:
    case OnlyOfficeDocumentTypes.POT:
    case OnlyOfficeDocumentTypes.OTP:
    case OnlyOfficeDocumentTypes.ODP:
      return { id: 'pptxEditor', key: `${OnlyOfficeDocumentTypes.PPTX}${Math.random() * 100}`, documentType: 'slide' };

    case OnlyOfficeDocumentTypes.PDF:
      return { id: 'pdfEditor', key: `${OnlyOfficeDocumentTypes.PDF}${Math.random() * 100}`, documentType: 'word' };

    default:
      return { id: 'docxEditor', key: `unknown${Math.random() * 100}`, documentType: 'word' };
  }
};

export default findDocumentsEditorType;
