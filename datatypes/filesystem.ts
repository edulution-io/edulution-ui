export interface DirectoryFile {
  basename: string;
  etag: string;
  filename: string;
  lastmod?: string;
  size?: number;
  type?: string;
}

export enum ContentType {
  file= "File",
  directory="Directory"
}