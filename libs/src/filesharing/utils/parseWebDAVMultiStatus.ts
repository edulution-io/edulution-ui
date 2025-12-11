/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
