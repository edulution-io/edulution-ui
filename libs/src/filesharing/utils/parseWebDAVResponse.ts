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
      const fallbackName = fallback.split('/').filter(Boolean)[1] || '/';
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
    filePath: response[WebdavXmlAttributes.Href],
    lastmod,
    size: contentLength ? parseInt(contentLength, 10) : undefined,
    type: isCollection ? ContentType.DIRECTORY : ContentType.FILE,
  } as DirectoryFileDTO;
};

export default parseWebDAVResponse;
