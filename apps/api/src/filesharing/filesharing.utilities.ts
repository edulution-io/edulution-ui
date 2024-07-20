import { XMLParser } from 'fast-xml-parser';
import he from 'he';
import { ContentType, DirectoryFile } from '@libs/filesharing/filesystem';
import { Logger } from '@nestjs/common';
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

function parseWebDAVResponse(response: WebDAVResponse): DirectoryFile {
  const propstatArray = Array.isArray(response[XA.PropStat]) ? response[XA.PropStat] : [response[XA.PropStat]];
  const props = propstatArray.find((ps) => ps[XA.Status].includes('200 OK'))?.[XA.Prop];

  if (!props) {
    return {} as DirectoryFile;
  }

  const {
    [XA.DisplayName]: displayName,
    [XA.ResourceType]: resourceType,
    [XA.GetETag]: etag = '',
    [XA.GetLastModified]: lastmod,
    [XA.GetContentLength]: contentLength,
  } = props;
  const isCollection = resourceType?.[XA.Collection] !== undefined;
  const decodedBasename = he.decode(String(displayName));

  return {
    basename: decodedBasename,
    etag,
    filename: response[XA.Href],
    lastmod,
    size: contentLength ? parseInt(contentLength, 10) : undefined,
    type: isCollection ? ContentType.directory : ContentType.file,
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

export function mapToDirectoryFiles(xmlData: string): DirectoryFile[] {
  try {
    const responses = parseWebDAVMultiStatus(xmlData);
    return responses.map(parseWebDAVResponse).filter((file) => file && file.basename !== '');
  } catch (error) {
    Logger.error('Error parsing XML data:', error);
    return [];
  }
}

export function mapToDirectories(xmlData: string): DirectoryFile[] {
  try {
    const responses = parseWebDAVMultiStatus(xmlData);
    return responses
      .map(parseWebDAVResponse)
      .filter((file) => file && file.type === ContentType.directory && file.basename !== '');
  } catch (error) {
    Logger.error('Error parsing XML data:', error);
    return [];
  }
}

export default { mapToDirectoryFiles, mapToDirectories, fromBase64 };
