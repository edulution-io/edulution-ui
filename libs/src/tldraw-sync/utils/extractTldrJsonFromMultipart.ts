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

const extractTldrJsonFromMultipart = (raw: string, partName: string = 'file'): string | null => {
  const normalized = raw.replaceAll('\r\n', '\n');

  const firstNewlineIdx = normalized.indexOf('\n');
  if (firstNewlineIdx <= 0) return null;

  const boundaryLine = normalized.slice(0, firstNewlineIdx).trim();
  if (!boundaryLine.startsWith('--')) return null;

  const boundaryToken = boundaryLine.slice(2);
  if (!boundaryToken) return null;

  const partNameMarker = `name="${partName}"`;
  const partHeaderIdx = normalized.indexOf(partNameMarker);
  if (partHeaderIdx === -1) return null;

  const headerSeparator = '\n\n';
  const headerEndIdx = normalized.indexOf(headerSeparator, partHeaderIdx);
  if (headerEndIdx === -1) return null;

  const bodyStartIdx = headerEndIdx + headerSeparator.length;
  const nextBoundaryMarker = `\n--${boundaryToken}`;
  const bodyEndIdx = normalized.indexOf(nextBoundaryMarker, bodyStartIdx);

  const partBody = bodyEndIdx === -1 ? normalized.slice(bodyStartIdx) : normalized.slice(bodyStartIdx, bodyEndIdx);

  const jsonCandidate = partBody.trim();
  return jsonCandidate.startsWith('{') || jsonCandidate.startsWith('[') ? jsonCandidate : null;
};

export default extractTldrJsonFromMultipart;
