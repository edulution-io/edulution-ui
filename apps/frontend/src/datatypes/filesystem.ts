export interface DirectoryFile {
  basename: string;
  etag: string;
  filename: string;
  lastmod?: string;
  size?: number;
  type?: string;
  [key: string]: string | number | boolean | undefined;
}

export enum ContentType {
  file = 'file',
  directory = 'collection',
}
