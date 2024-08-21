import { XMLParser } from 'fast-xml-parser';
import { decode } from 'he';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import ContentType from '@libs/filesharing/types/contentType';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
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
  const responses = parseWebDAVMultiStatus(xmlData);
  return responses.map(parseWebDAVResponse).filter((file) => file && file.basename !== '');
}

export function mapToDirectories(xmlData: string): DirectoryFileDTO[] {
  const responses = parseWebDAVMultiStatus(xmlData);
  return responses
    .map(parseWebDAVResponse)
    .filter((file) => file && file.type === ContentType.DIRECTORY && file.basename !== '');
}

export function transformWebdavResponse(response: WebdavStatusReplay): WebdavStatusReplay {
  return {
    success: response.status >= 200 && response.status < 300,
    status: response.status,
  } as WebdavStatusReplay;
}

export default { mapToDirectoryFiles, mapToDirectories };
