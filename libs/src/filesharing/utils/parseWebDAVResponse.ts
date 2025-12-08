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

import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { decode } from 'he';
import ContentType from '@libs/filesharing/types/contentType';
import WebdavResponse from '@libs/filesharing/types/webdavResponse';
import WebdavXmlAttributes from '@libs/filesharing/types/webdavXmlAttributes';
import WebdavPropStat from '@libs/filesharing/types/webdavPropStat';
import WebdavProperty from '@libs/filesharing/types/webdavProperty';

const parseWebDAVResponse = (response: WebdavResponse) => {
  const rawPropstat = response[WebdavXmlAttributes.PropStat];
  const rawHref = response[WebdavXmlAttributes.Href];
  const propstatArray: WebdavPropStat[] = Array.isArray(rawPropstat) ? rawPropstat : [rawPropstat];

  const successEntry = propstatArray.find((ps) => {
    const statusVal = ps[WebdavXmlAttributes.Status];
    const statusList = Array.isArray(statusVal) ? statusVal : [statusVal];
    return statusList.some((s) => String(s).includes('200 OK'));
  });

  const props = successEntry?.[WebdavXmlAttributes.Prop] as WebdavProperty;
  if (!props) {
    return {} as DirectoryFileDTO;
  }

  const getDisplayName = (name: string | undefined, fallback: string): string | undefined => {
    if (!name) {
      const fallbackName = fallback.split('/').filter(Boolean).at(-1) || '/';
      return fallbackName;
    }
    return name;
  };

  const {
    [WebdavXmlAttributes.DisplayName]: displayName,
    [WebdavXmlAttributes.ResourceType]: resourceType,
    [WebdavXmlAttributes.GetETag]: etag = '',
    [WebdavXmlAttributes.GetLastModified]: lastmod,
    [WebdavXmlAttributes.GetContentLength]: contentLength,
  } = props;

  const isCollection = resourceType?.[WebdavXmlAttributes.Collection] !== undefined;

  const decodedBasename = decode(String(getDisplayName(displayName, rawHref)));

  return {
    filename: decodedBasename,
    etag,
    filePath: decodeURIComponent(response[WebdavXmlAttributes.Href]),
    lastmod,
    size: contentLength ? parseInt(contentLength, 10) : undefined,
    type: isCollection ? ContentType.DIRECTORY : ContentType.FILE,
  } as DirectoryFileDTO;
};

export default parseWebDAVResponse;
