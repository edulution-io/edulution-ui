import { XMLParser } from 'fast-xml-parser';
import he from 'he';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import { WebDAVMultiStatus, WebDAVPropStat, WebDAVResponse } from './webdav.types';

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  arrayMode: true,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
};

const parser = new XMLParser(options);

function parseWebDAVResponse(response: WebDAVResponse): DirectoryFile {
  const propstatArray: WebDAVPropStat[] = Array.isArray(response['d:propstat'])
    ? response['d:propstat']
    : [response['d:propstat']];
  const props = propstatArray.find((ps) => ps['d:status'].includes('200 OK'))?.['d:prop'];

  if (!props) {
    return {} as DirectoryFile;
  }

  const isCollection = props?.['d:resourcetype']?.['d:collection'] !== undefined;
  const basename = props['d:displayname'];
  const decodedBasename = he.decode(String(basename));

  return {
    basename: decodedBasename,
    etag: props?.['d:getetag'] ?? '',
    filename: response['d:href'],
    lastmod: props?.['d:getlastmodified'],
    size: props?.['d:getcontentlength'] ? parseInt(props['d:getcontentlength'], 10) : undefined,
    type: isCollection ? 'collection' : 'file',
  };
}

function parseWebDAVMultiStatus(xmlData: string) {
  const jsonObj: WebDAVMultiStatus = parser.parse(xmlData) as WebDAVMultiStatus;
  if (!jsonObj['d:multistatus'] || !jsonObj['d:multistatus']['d:response']) {
    console.warn('Invalid or empty WebDAV response structure: missing "d:response".');
    return [];
  }

  const responses: WebDAVResponse[] = Array.isArray(jsonObj['d:multistatus']['d:response'])
    ? jsonObj['d:multistatus']['d:response']
    : [jsonObj['d:multistatus']['d:response']];
  return responses;
}

export function mapToDirectoryFiles(xmlData: string): DirectoryFile[] {
  try {
    const responses = parseWebDAVMultiStatus(xmlData);
    return responses.map(parseWebDAVResponse).filter((file) => file && file.basename !== '');
  } catch (error) {
    console.error('Error parsing XML data:', error);
    return [];
  }
}

export function mapToDirectories(xmlData: string): DirectoryFile[] {
  try {
    const responses = parseWebDAVMultiStatus(xmlData);
    return responses
      .map(parseWebDAVResponse)
      .filter((file) => file && file.type === 'collection' && file.basename !== '');
  } catch (error) {
    console.error('Error parsing XML data:', error);
    return [];
  }
}

export default { mapToDirectoryFiles, mapToDirectories };
