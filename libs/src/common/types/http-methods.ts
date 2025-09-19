/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

export enum HttpMethodsWebDav {
  MOVE = 'move',
  MKCOL = 'mkcol',
  PROPFIND = 'propfind',
  COPY = 'copy',
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
  APPLICATION_ZIP = 'application/zip',
  APPLICATION_XML = 'application/xml',
  APPLICATION_PDF = 'application/pdf',
  APPLICATION_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded',
  TEXT_PLAIN = 'text/plain',
  TEXT_CSV = 'text/csv',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  APPLICATION_OCTET_STREAM = 'application/octet-stream',
  APPLICATION_GITHUB_RAW = 'application/vnd.github.v3.raw',
}

export const HTTP_HEADERS = {
  ContentDisposition: 'Content-Disposition',
  ContentType: 'Content-Type',
  ContentLength: 'Content-Length',
  Authorization: 'Authorization',
  XApiKey: 'x-api-key',
  CONNECTION_UID: 'Connection-Uid',
  XForwaredFor: 'x-forwarded-for',
  UserAgent: 'User-Agent',
  Depth: 'Depth',
} as const;

export enum WebdavRequestDepth {
  ONLY_SELF = '0',
  ONE_LEVEL = '1',
  ALL = 'infinity',
}
