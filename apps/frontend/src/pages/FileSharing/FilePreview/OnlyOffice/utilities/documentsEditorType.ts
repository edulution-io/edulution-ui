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
