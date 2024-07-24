export enum HttpMethodesWebDav {
  MOVE = 'move',
  MKCOL = 'mkcol',
  PROPFIND = 'propfind',
}

export enum HttpMethodes {
  PUT = 'put',
  POST = 'post',
  DELETE = 'delete',
  GET = 'get',
}

export enum ResponseType {
  ARRAYBUFFER = 'arraybuffer',
  BLOB = 'blob',
  DOCUMENT = 'document',
  JSON = 'json',
  STREAM = 'stream',
  TEXT = 'text',
}

export enum RequestResponseContentType {
  APPLICATION_JSON = 'application/json',
  APPLICATION_XML = 'application/xml',
  APPLICATION_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded',
  TEXT_PLAIN = 'text/plain',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  APPLICATION_OCET_STREAM = 'application/octet-stream',
}
