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
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import Progress from '@/components/ui/Progress';

interface ShareFileInformationBoxProps {
  filesharingProgress: FilesharingProgressDto | null;
}

const ShareFileInformationBox: React.FC<ShareFileInformationBoxProps> = ({ filesharingProgress }) => (
  <div className="flex flex-col gap-2 rounded  border p-4 shadow">
    <h2 className="text-sm font-bold">Share File Information</h2>
    <Progress value={filesharingProgress?.percent} />
    <p className="text-sm text-background">
      Total : {filesharingProgress?.total} davon {filesharingProgress?.processed} erfolgreich
    </p>
    <p className="text-sm text-background">
      File Name: {filesharingProgress?.currentFile} wird an {filesharingProgress?.studentName} geteilt
    </p>
  </div>
);

export default ShareFileInformationBox;
