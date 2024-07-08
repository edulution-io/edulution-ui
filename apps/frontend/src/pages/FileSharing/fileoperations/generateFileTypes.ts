import { Document, Packer, Paragraph, TextRun } from 'docx';
import PptxGenJS from 'pptxgenjs';
import ExcelJS from 'exceljs';
import { create } from 'xmlbuilder2';

interface GenerateFile {
  [key: string]: (title: string) => Promise<File> | File;
  docx: (title: string) => Promise<File>;
  txt: (title: string) => File;
  drawio: (title: string) => File;
  xlsx: (title: string) => Promise<File>;
  pptx: (title: string) => Promise<File>;
}

const generateFile: GenerateFile = {
  docx: async function createWordDocumentWithMetadata(title: string): Promise<File> {
    const doc = new Document({
      title,
      description: 'Created by edulution',
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun('Hello World'),
                new TextRun({
                  text: 'Foo Bar',
                  bold: true,
                }),
                new TextRun({
                  text: '\tGithub is the best',
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    return new File([blob], `${title}.docx`, { type: blob.type });
  },

  txt: function createTextFile(title: string): File {
    const content = 'Hello World';
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], `${title}.txt`, { type: blob.type });
  },

  drawio: function createDrawioFile(title: string): File {
    const xml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('mxfile', { host: 'app.diagrams.net' })
      .ele('diagram', { name: title })
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
    return new File([fileBlob], `${title}.drawio`, { type: fileBlob.type });
  },

  xlsx: async function createExcelFile(title: string): Promise<File> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet 1');
    sheet.addRow(['Hello World']);
    sheet.addRow(['Foo', 'Bar', 'Baz']);
    const buffer = await workbook.xlsx.writeBuffer();
    const fileBlob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return new File([fileBlob], `${title}.xlsx`, { type: fileBlob.type });
  },

  pptx: async function createPowerPointFile(title: string): Promise<File> {
    const fileName = `${title}.pptx`;
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    pptx.title = title;
    const textboxText = 'Hello World from PptxGenJS!';
    const textboxOpts = { x: 1, y: 1, color: '363636' };
    slide.addText(textboxText, textboxOpts);
    const pptxBlob = await pptx.write();
    const fileBlob = new Blob([pptxBlob], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    return new File([fileBlob], fileName, { type: fileBlob.type });
  },
};

export default generateFile;
