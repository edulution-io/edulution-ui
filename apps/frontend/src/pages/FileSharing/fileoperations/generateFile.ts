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

import axios from 'axios';
import { Document, Packer } from 'docx';
import PptxGenJS from 'pptxgenjs';
import ExcelJS from 'exceljs';
import { create } from 'xmlbuilder2';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';
import DocumentVendors from '@libs/filesharing/constants/documentVendors';
import DocumentVendorsType from '@libs/filesharing/types/documentVendorsType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';
import OPEN_DOCUMENT_TEMPLATE_PATH from '@libs/filesharing/constants/openDocumentTemplatePath';
import { toast } from 'sonner';
import i18n from '@/i18n';
import * as OpenOfficeXLSX from 'xlsx';

const generateFile = async (
  fileType: TAvailableFileTypes | '',
  basename: string,
  format: DocumentVendorsType,
  onlyReturnExtension: boolean = false,
): Promise<{ file?: File; extension: string }> => {
  let file: File;
  let extension: string;

  switch (fileType) {
    case AVAILABLE_FILE_TYPES.documentFile: {
      extension = format === DocumentVendors.MSO ? OnlyOfficeDocumentTypes.DOCX : OnlyOfficeDocumentTypes.ODT;
      if (onlyReturnExtension) return { extension };
      if (format === DocumentVendors.MSO) {
        const doc = new Document({ title: basename, description: '', sections: [] });
        const blob = await Packer.toBlob(doc);
        file = new File([blob], `${basename}.${extension}`, { type: blob.type });
      } else {
        const response = await axios.get(`${OPEN_DOCUMENT_TEMPLATE_PATH}/odtTemplate.odt`, {
          responseType: 'arraybuffer',
        });
        const fileBlob = new Blob([response.data], { type: 'application/vnd.oasis.opendocument.text' });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      }
      break;
    }

    case AVAILABLE_FILE_TYPES.spreadsheetFile: {
      extension = format === DocumentVendors.MSO ? OnlyOfficeDocumentTypes.XLSX : OnlyOfficeDocumentTypes.ODS;
      if (onlyReturnExtension) return { extension };
      if (format === DocumentVendors.MSO) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(basename);
        worksheet.name = basename;
        const buffer = await workbook.xlsx.writeBuffer();
        const fileBlob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      } else {
        const workbook = OpenOfficeXLSX.utils.book_new();

        const data = [[]];
        const worksheet = OpenOfficeXLSX.utils.aoa_to_sheet(data);
        OpenOfficeXLSX.utils.book_append_sheet(workbook, worksheet, 'Tabelle1');

        const wbArrayBuffer = OpenOfficeXLSX.write(workbook, { bookType: 'ods', type: 'array' }) as ArrayBuffer;

        const fileBlob = new Blob([wbArrayBuffer], {
          type: 'application/vnd.oasis.opendocument.spreadsheet',
        });

        file = new File([fileBlob], `${basename}.${extension}`, {
          type: fileBlob.type,
        });
      }
      break;
    }

    case AVAILABLE_FILE_TYPES.presentationFile: {
      extension = format === DocumentVendors.MSO ? OnlyOfficeDocumentTypes.PPTX : OnlyOfficeDocumentTypes.ODP;
      if (onlyReturnExtension) return { extension };
      if (format === DocumentVendors.MSO) {
        const pptx = new PptxGenJS();
        pptx.title = basename;
        const pptxBlob = await pptx.write();
        const fileBlob = new Blob([pptxBlob], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      } else {
        const response = await axios.get(`${OPEN_DOCUMENT_TEMPLATE_PATH}/odpTemplate.odp`, {
          responseType: 'arraybuffer',
        });
        const fileBlob = new Blob([response.data], { type: 'application/vnd.oasis.opendocument.presentation' });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      }
      break;
    }

    case AVAILABLE_FILE_TYPES.textFile: {
      extension = OnlyOfficeDocumentTypes.TXT;
      if (onlyReturnExtension) return { extension };
      const textBlob = new Blob([''], { type: RequestResponseContentType.TEXT_PLAIN });
      file = new File([textBlob], `${basename}.${extension}`, { type: textBlob.type });
      break;
    }

    case AVAILABLE_FILE_TYPES.drawIoFile: {
      extension = 'drawio';
      if (onlyReturnExtension) return { extension };
      const xml = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('mxfile', { host: 'app.diagrams.net' })
        .ele('diagram', { name: basename })
        .ele('mxGraphModel', {
          dx: '0',
          dy: '0',
          grid: '1',
          gridSize: '10',
          guides: '1',
          tooltips: '1',
          connect: '1',
          arrows: '1',
          fold: '1',
          page: '1',
          pageScale: '1',
          pageWidth: '827',
          pageHeight: '1169',
          math: '0',
          shadow: '0',
        })
        .ele('root')
        .ele('mxCell', { id: '0' })
        .up()
        .ele('mxCell', { id: '1', parent: '0' })
        .up()
        .up()
        .up()
        .up()
        .end({ prettyPrint: true });

      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(xml);
      const fileBlob = new Blob([uint8Array], { type: 'application/vnd.jgraph.mxfile' });
      file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      break;
    }

    default:
      toast.error(i18n.t('errors.fileGenerationFailed'));
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  return { file, extension };
};

export default generateFile;
