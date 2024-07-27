export interface DirectoryFileDTO {
  basename: string;
  etag: string;
  filename: string;
  lastmod?: string;
  size?: number;
  type?: string;

  [key: string]: string | number | boolean | undefined;
}
