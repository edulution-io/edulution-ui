import { XMLParser } from 'fast-xml-parser';
import he from 'he';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { Logger } from '@nestjs/common';
import ContentType from '@libs/filesharing/types/contentType';
import ValidTime from '@libs/filesharing/types/validTime';
import { addDays, addHours, addMonths, addWeeks, addYears } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import DE_TZ from '@libs/common/contants/timeZone';
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

export function getExpirationDate(validTime: ValidTime): Date {
  const now = toZonedTime(new Date(), DE_TZ);
  Logger.log(validTime);
  switch (validTime) {
    case ValidTime.ONE_HOUR:
      return addHours(now, 1);
    case ValidTime.ONE_DAY:
      return addDays(now, 1);
    case ValidTime.ONE_WEEK:
      return addWeeks(now, 1);
    case ValidTime.ONE_MONTH:
      return addMonths(now, 1);
    case ValidTime.ONE_YEAR:
      return addYears(now, 1);
    default:
      return now;
  }
}

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

export default { mapToDirectoryFiles, mapToDirectories, fromBase64 };
