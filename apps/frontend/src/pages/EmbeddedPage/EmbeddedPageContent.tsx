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

import React from 'react';
import type TAppFieldType from '@libs/appconfig/types/tAppFieldType';

type EmbeddedPageContentProps = {
  pageTitle: string;
  isSandboxMode?: TAppFieldType;
  htmlContentUrl?: string;
  htmlContent?: string;
};

const EmbeddedPageContent: React.FC<EmbeddedPageContentProps> = ({
  pageTitle,
  isSandboxMode,
  htmlContentUrl,
  htmlContent,
}) =>
  isSandboxMode ? (
    <iframe
      src={htmlContentUrl}
      title={pageTitle}
      className="h-full w-full border-0"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
    />
  ) : (
    <div
      className="h-full w-full"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
    />
  );
export default EmbeddedPageContent;
