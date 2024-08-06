import type PrintPasswordsFormat from '@libs/classManagement/types/printPasswordsFormat';

type PrintPasswordsFormatType = `${PrintPasswordsFormat}`;

interface PrintPasswordsRequest {
  format: PrintPasswordsFormatType;
  one_per_page: boolean;
  pdflatex: boolean;
  school: string;
  schoolclasses: string[];
}

export default PrintPasswordsRequest;
