export interface WebDAVResourceType {
  'd:collection'?: any;
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
