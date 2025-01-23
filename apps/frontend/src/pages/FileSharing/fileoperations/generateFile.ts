import { Document, Packer } from 'docx';
import PptxGenJS from 'pptxgenjs';
import ExcelJS from 'exceljs';
import { create } from 'xmlbuilder2';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { AvailableFileTypesType } from '@libs/filesharing/types/availableFileTypesType';
import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';
import DocumentVendors from '@libs/filesharing/constants/documentVendors';
import DocumentVendorsType from '@libs/filesharing/types/documentVendorsType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';

async function generateFile(
  fileType: AvailableFileTypesType | '',
  basename: string,
  format: DocumentVendorsType,
): Promise<{ file: File; extension: string }> {
  let file: File;
  let extension: string;

  switch (fileType) {
    case AVAILABLE_FILE_TYPES.documentFile: {
      if (format === DocumentVendors.MSO) {
        extension = OnlyOfficeDocumentTypes.DOCX;

        const doc = new Document({ title: basename, description: '', sections: [] });

        const blob = await Packer.toBlob(doc);

        file = new File([blob], `${basename}.${extension}`, { type: blob.type });
      } else {
        extension = OnlyOfficeDocumentTypes.ODT;

        const response = await fetch('/openDocumentTemplates/odtTemplate.odt');

        const arrayBuffer = await response.arrayBuffer();

        const fileBlob = new Blob([arrayBuffer], { type: 'application/vnd.oasis.opendocument.text' });

        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      }
      break;
    }

    case AVAILABLE_FILE_TYPES.spreadsheetFile: {
      if (format === DocumentVendors.MSO) {
        extension = OnlyOfficeDocumentTypes.XLSX;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(basename);
        worksheet.name = basename;
        const buffer = await workbook.xlsx.writeBuffer();
        const fileBlob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      } else {
        extension = OnlyOfficeDocumentTypes.ODS;
        const response = await fetch('/openDocumentTemplates/odsTemplate.ods');
        const arrayBuffer = await response.arrayBuffer();
        const fileBlob = new Blob([arrayBuffer], { type: 'application/vnd.oasis.opendocument.spreadsheet' });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      }
      break;
    }

    case AVAILABLE_FILE_TYPES.presentationFile: {
      if (format === DocumentVendors.MSO) {
        extension = OnlyOfficeDocumentTypes.PPTX;
        const pptx = new PptxGenJS();
        pptx.title = basename;
        const pptxBlob = await pptx.write();
        const fileBlob = new Blob([pptxBlob], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      } else {
        extension = OnlyOfficeDocumentTypes.ODP;
        const response = await fetch('/openDocumentTemplates/odpTemplate.odp');
        const arrayBuffer = await response.arrayBuffer();
        const fileBlob = new Blob([arrayBuffer], { type: 'application/vnd.oasis.opendocument.presentation' });
        file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      }
      break;
    }

    case AVAILABLE_FILE_TYPES.textFile: {
      extension = OnlyOfficeDocumentTypes.TXT;
      const textBlob = new Blob([''], { type: RequestResponseContentType.TEXT_PLAIN });
      file = new File([textBlob], `${basename}.${extension}`, { type: textBlob.type });
      break;
    }

    case AVAILABLE_FILE_TYPES.drawIoFile: {
      extension = 'drawio';
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
      const fileBlob = new Blob([uint8Array], {
        type: 'application/vnd.jgraph.mxfile',
      });
      file = new File([fileBlob], `${basename}.${extension}`, { type: fileBlob.type });
      break;
    }

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  return { file, extension };
}

export default generateFile;
