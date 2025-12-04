/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
  TEXT_HTML = 'text/html',
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
