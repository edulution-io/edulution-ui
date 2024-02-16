export interface DirectoryFile {
  basename: string;
  etag: string;
  filename: string;
  lastmod?: string;
  size?: number;
  type?: string;
  [key: string]: any;
}

export enum ContentType {
  file= "File",
  directory="Directory"
}