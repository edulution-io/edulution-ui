export interface WebDAVResourceType {
  'd:collection'?: any; // Presence of this tag implies a directory
}

export interface WebDAVProperty {
  'd:getcontentlength'?: string;
  'd:displayname'?: string;
  'd:creationdate'?: string;
  'd:getlastmodified'?: string;
  'd:getetag'?: string;
  'd:resourcetype'?: WebDAVResourceType;
}

export interface WebDAVPropStat {
  'd:prop': WebDAVProperty;
  'd:status': string;
}

export interface WebDAVResponse {
  'd:href': string;
  'd:propstat': WebDAVPropStat[];
}

export interface WebDAVMultiStatus {
  'd:multistatus': {
    'd:response': WebDAVResponse[];
  };
}

export interface DirectoryFile {
  basename: string;
  etag: string;
  filename: string;
  lastmod?: string;
  size?: number;
  type?: string; // 'file' or 'collection'
}
