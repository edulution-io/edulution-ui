import { XMLParser } from 'fast-xml-parser';
import he from 'he';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { Logger } from '@nestjs/common';
import ContentType from '@libs/filesharing/types/contentType';
import pathNode from 'path';
import fs from 'fs';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import syncRequest from 'sync-request';
import CustomFile from '@libs/filesharing/types/customFile';
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
  const decodedBasename = he.decode(String(displayName));

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

export function retrieveAndSaveFile(filename: string, body: OnlyOfficeCallbackData): CustomFile | undefined {
  if ((body.status !== 2 && body.status !== 4) || !body.url) {
    return undefined;
  }

  try {
    const file = syncRequest('GET', body.url);
    const filePath = pathNode.join(__dirname, `../public/downloads/${filename}`);
    fs.mkdirSync(pathNode.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.getBody());
    const fileBuffer = fs.readFileSync(filePath);

    return {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'text/plain',
      buffer: fileBuffer,
      size: fileBuffer.length,
    } as CustomFile;
  } catch (error) {
    return undefined;
  }
}

export default { mapToDirectoryFiles, mapToDirectories };
