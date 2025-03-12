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

interface SharingFilesFailedDialogBodyProps {
  failedFile: string;
  affectedUsers: string[];
}

const SharingFilesFailedDialogBody: React.FC<SharingFilesFailedDialogBodyProps> = ({ failedFile, affectedUsers }) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-sm font-bold">Datei „{failedFile}“ konnte nicht geteilt werden</h2>

    <p className="text-sm text-background">Die folgende(n) Person(en) haben die Datei nicht erhalten:</p>

    <ul className="list-inside list-disc pl-4 text-sm text-background">
      {affectedUsers.map((user) => (
        <li key={user}>{user}</li>
      ))}
    </ul>
  </div>
);

export default SharingFilesFailedDialogBody;
