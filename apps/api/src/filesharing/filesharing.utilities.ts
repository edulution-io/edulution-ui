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

import { XMLParser } from 'fast-xml-parser';
import { decode } from 'he';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { Logger } from '@nestjs/common';
import ContentType from '@libs/filesharing/types/contentType';
import { WebDAVMultiStatus, WebDAVResponse, XMLAttributes as XA } from './filesharing.types';

const xmlOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  arrayMode: true,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
};

const xmlParser = new XMLParser(xmlOptions);

function parseWebDAVResponse(response: WebDAVResponse): DirectoryFileDTO {
  const propstatArray = Array.isArray(response[XA.PropStat]) ? response[XA.PropStat] : [response[XA.PropStat]];
  const props = propstatArray.find((ps) => ps[XA.Status].includes('200 OK'))?.[XA.Prop];

  if (!props) {
    return {} as DirectoryFileDTO;
  }

  const {
    [XA.DisplayName]: displayName,
    [XA.ResourceType]: resourceType,
    [XA.GetETag]: etag = '',
    [XA.GetLastModified]: lastmod,
    [XA.GetContentLength]: contentLength,
  } = props;
  const isCollection = resourceType?.[XA.Collection] !== undefined;
  const decodedBasename = decode(String(displayName));

  return {
    basename: decodedBasename,
    etag,
    filename: response[XA.Href],
    lastmod,
    size: contentLength ? parseInt(contentLength, 10) : undefined,
    type: isCollection ? ContentType.DIRECTORY : ContentType.FILE,
  };
}

export function fromBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8');
}

function parseWebDAVMultiStatus(xmlData: string) {
  const jsonObj: WebDAVMultiStatus = xmlParser.parse(xmlData) as WebDAVMultiStatus;
  if (!jsonObj[XA.MultiStatus] || !jsonObj[XA.MultiStatus][XA.Response]) {
    return [];
  }

  const responses: WebDAVResponse[] = Array.isArray(jsonObj[XA.MultiStatus][XA.Response])
    ? jsonObj[XA.MultiStatus][XA.Response]
    : [jsonObj[XA.MultiStatus][XA.Response]];
  return responses;
}

export function mapToDirectoryFiles(xmlData: string): DirectoryFileDTO[] {
  try {
    const responses = parseWebDAVMultiStatus(xmlData);
    return responses.map(parseWebDAVResponse).filter((file) => file && file.basename !== '');
  } catch (error) {
    Logger.error('Error parsing XML data:', error);
    return [];
  }
}

export function mapToDirectories(xmlData: string): DirectoryFileDTO[] {
  try {
    const responses = parseWebDAVMultiStatus(xmlData);
    return responses
      .map(parseWebDAVResponse)
      .filter((file) => file && file.type === ContentType.DIRECTORY && file.basename !== '');
  } catch (error) {
    Logger.error('Error parsing XML data:', error);
    return [];
  }
}

export default { mapToDirectoryFiles, mapToDirectories };
