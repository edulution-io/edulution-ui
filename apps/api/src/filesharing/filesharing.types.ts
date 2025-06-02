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
