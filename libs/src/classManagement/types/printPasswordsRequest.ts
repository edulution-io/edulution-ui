interface PrintPasswordsRequest {
  format: 'pdf' | 'csv';
  one_per_page: boolean;
  pdflatex: boolean;
  school: string;
  schoolclasses: string[];
}

export default PrintPasswordsRequest;
