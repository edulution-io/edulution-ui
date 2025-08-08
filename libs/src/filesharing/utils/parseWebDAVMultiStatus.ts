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
import WebdavXmlAttributes from '@libs/filesharing/types/webdavXmlAttributes';
import WebdavMultiStatus from '@libs/filesharing/types/webdavMultiStatus';
import { Logger } from '@nestjs/common';

const xmlOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  arrayMode: true,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  transformTagName: (tagName: string) => tagName.toLowerCase(),
};

const parseWebDAVMultiStatus = (xmlData: string) => {
  try {
    const parser = new XMLParser(xmlOptions);
    const jsonObj = parser.parse(xmlData) as WebdavMultiStatus;

    const multiStatus = jsonObj[WebdavXmlAttributes.MultiStatus];
    if (!multiStatus) {
      return [];
    }

    const responsesRaw = multiStatus[WebdavXmlAttributes.Response];
    if (!responsesRaw) {
      return [];
    }

    const responses = Array.isArray(responsesRaw) ? responsesRaw : [responsesRaw];
    return responses;
  } catch (error) {
    Logger.error('Error parsing XML data:', error);
    return [];
  }
};

export default parseWebDAVMultiStatus;
