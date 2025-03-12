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

export class FilesharingProgressDto {
  processID: number;

  processed: number;

  total: number;

  percent: number;

  currentFile: string;

  studentName: string;

  failedPaths?: string[];

  constructor(
    processID: number,
    processed: number,
    total: number,
    studentName: string,
    percent: number,
    currentFile: string,
    failedPaths?: string[],
  ) {
    this.processID = processID;
    this.processed = processed;
    this.total = total;
    this.studentName = studentName;
    this.percent = percent;
    this.currentFile = currentFile;
    this.failedPaths = failedPaths;
  }
}

export default FilesharingProgressDto;
