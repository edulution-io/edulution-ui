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
import PublicFileShareDto from '@libs/filesharing/types/publicFileShareDto';

interface PublicFileDownloadInfoProps {
  publicFileShareDto: PublicFileShareDto;
}

const PublicFileDownloadInfo: React.FC<PublicFileDownloadInfoProps> = ({ publicFileShareDto }) => {
  const { filename, fileLink, validUntil, createdAt, creator } = publicFileShareDto;
  const apiPath = fileLink.startsWith('/') ? fileLink.slice(1) : fileLink;

  return (
    <section className="flex items-start justify-center px-4 py-12 sm:px-10 lg:px-32">
      <article className="w-full max-w-2xl space-y-6 rounded-2xl bg-accent p-8 shadow-2xl backdrop-blur-md">
        <h2 className="truncate text-2xl font-semibold">{filename}</h2>
        <h3>{creator}</h3>
        <a
          href={fileLink.startsWith('/') ? apiPath : `/${apiPath}`}
          target="_blank"
          download={filename}
          rel="noopener noreferrer"
          className="block w-full rounded-lg bg-blue-600 py-3 text-center text-lg font-medium text-background transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600"
        >
          Datei herunterladen
        </a>

        <ul className="space-y-1 text-sm">
          <li>
            <strong>Erstellt:</strong> {new Date(createdAt).toLocaleString('de-DE')}
          </li>
          <li>
            <strong>Gültig bis:</strong> {new Date(validUntil).toLocaleString('de-DE')}
          </li>
        </ul>
      </article>
    </section>
  );
};

export default PublicFileDownloadInfo;
