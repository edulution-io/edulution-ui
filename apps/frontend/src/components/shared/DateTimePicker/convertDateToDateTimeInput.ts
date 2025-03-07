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

function addLeadingZero(value: number, length: number = 2): string {
  return String(value).padStart(length, '0');
}

function convertDateToDateTimeInput(date: Date): string {
  const year = addLeadingZero(date.getUTCFullYear(), 4);
  const month = addLeadingZero(date.getMonth() + 1);
  const day = addLeadingZero(date.getDate());
  const hours = addLeadingZero(date.getHours());
  const minutes = addLeadingZero(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function fixDateTimeInput(value: string | Date | undefined): string {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return convertDateToDateTimeInput(date);
  }
  return convertDateToDateTimeInput(value);
}
