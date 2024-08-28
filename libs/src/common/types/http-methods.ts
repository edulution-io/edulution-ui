export enum HttpMethodsWebDav {
  MOVE = 'move',
  MKCOL = 'mkcol',
  PROPFIND = 'propfind',
}

export enum HttpMethods {
  PUT = 'put',
  POST = 'post',
  DELETE = 'delete',
  GET = 'get',
  PATCH = 'patch',
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
  APPLICATION_PDF = 'application/pdf',
  APPLICATION_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded',
  TEXT_PLAIN = 'text/plain',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  APPLICATION_OCTET_STREAM = 'application/octet-stream',
}

export const HTTP_HEADERS = {
  ContentDisposition: 'Content-Disposition',
  ContentType: 'Content-Type',
  Authorization: 'Authorization',
  XApiKey: 'x-api-key',
} as const;
