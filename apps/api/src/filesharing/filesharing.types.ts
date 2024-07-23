interface WebDAVResourceType {
  'd:collection'?: string;
}

interface WebDAVProperty {
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

export interface WebdavStatusReplay {
  success: boolean;
  status: number;
  filename?: string;
}

export enum XMLAttributes {
  DisplayName = 'd:displayname',
  ResourceType = 'd:resourcetype',
  Collection = 'd:collection',
  GetETag = 'd:getetag',
  GetLastModified = 'd:getlastmodified',
  GetContentLength = 'd:getcontentlength',
  PropStat = 'd:propstat',
  Status = 'd:status',
  Prop = 'd:prop',
  MultiStatus = 'd:multistatus',
  Response = 'd:response',
  Href = 'd:href',
}
