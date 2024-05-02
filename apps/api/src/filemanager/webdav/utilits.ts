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

function mapToDirectoryFiles(xmlData: string): DirectoryFile[] {
  const parser = new XMLParser(options);
  const jsonObj: WebDAVMultiStatus = parser.parse(xmlData) as WebDAVMultiStatus;
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

export default mapToDirectoryFiles;
