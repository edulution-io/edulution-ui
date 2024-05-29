import { XMLParser } from 'fast-xml-parser';
import { DirectoryFile, WebDAVPropStat, WebDAVMultiStatus } from './types';

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  arrayMode: true,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
};

export function mapToDirectoryFiles(xmlData: string): DirectoryFile[] {
  const parser = new XMLParser(options);
  const jsonObj: WebDAVMultiStatus = parser.parse(xmlData) as WebDAVMultiStatus;
  if (!jsonObj['d:multistatus'] || !Array.isArray(jsonObj['d:multistatus']['d:response'])) {
    console.warn('Invalid or empty WebDAV response structure: missing "d:response".');
    return [];
  }

  const responses = Array.isArray(jsonObj['d:multistatus']['d:response'])
    ? jsonObj['d:multistatus']['d:response']
    : [jsonObj['d:multistatus']['d:response']];
  const responseArray = Array.isArray(responses) ? responses : [responses];
  return responseArray.map((response) => {
    const props = response['d:propstat']
      .filter((ps: WebDAVPropStat) => ps['d:status'].includes('200 OK'))
      .map((ps: WebDAVPropStat) => ps['d:prop'])[0];

    return {
      basename: props['d:displayname'] ?? '',
      etag: props['d:getetag'] ?? '',
      filename: response['d:href'],
      lastmod: props['d:getlastmodified'],
      size: props['d:getcontentlength'] ? parseInt(props['d:getcontentlength'], 10) : undefined,
      type: props['d:resourcetype'] && props['d:resourcetype'] ? 'collection' : 'file',
    };
  });
}

export function mapToDirectories(xmlData: string): DirectoryFile[] {
  const parser = new XMLParser(options);
  const jsonObj: WebDAVMultiStatus = parser.parse(xmlData) as WebDAVMultiStatus;
  if (!jsonObj['d:multistatus'] || !Array.isArray(jsonObj['d:multistatus']['d:response'])) {
    console.warn('Invalid or empty WebDAV response structure: missing "d:response".');
    return [];
  }

  const responses = Array.isArray(jsonObj['d:multistatus']['d:response'])
    ? jsonObj['d:multistatus']['d:response']
    : [jsonObj['d:multistatus']['d:response']];

  return responses
    .filter((response) => {
      const props = response['d:propstat']
        .filter((ps: WebDAVPropStat) => ps['d:status'].includes('200 OK'))
        .map((ps: WebDAVPropStat) => ps['d:prop'])[0];
      return props['d:resourcetype'] && props['d:resourcetype']['d:collection'] !== undefined;
    })
    .map((response) => {
      const props = response['d:propstat']
        .filter((ps: WebDAVPropStat) => ps['d:status'].includes('200 OK'))
        .map((ps: WebDAVPropStat) => ps['d:prop'])[0];

      return {
        basename: props['d:displayname'] ?? '',
        etag: props['d:getetag'] ?? '',
        filename: response['d:href'],
        lastmod: props['d:getlastmodified'],
        size: props['d:getcontentlength'] ? parseInt(props['d:getcontentlength'], 10) : undefined,
        type: 'collection',
      };
    });
}
export default { mapToDirectoryFiles, mapToDirectories };
