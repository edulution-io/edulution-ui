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

const UMLAUT_MAP = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'Ae',
  Ö: 'Oe',
  Ü: 'Ue',
  ß: 'ss',
} as const;

const UMLAUT_REGEX = /[äöüÄÖÜß]/g;

const COMBINING_MARKS_REGEX = /\p{M}+/gu;

export function replaceGermanUmlauts(input: string): string {
  return input.replace(UMLAUT_REGEX, (m) => UMLAUT_MAP[m as keyof typeof UMLAUT_MAP]);
}

export function stripCombiningMarks(input: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(input)) return input;
  return input.normalize('NFKD').replace(COMBINING_MARKS_REGEX, '');
}

export function latinize(
  input: string,
  opts: { umlauts?: boolean; toLower?: boolean } = { umlauts: true, toLower: false },
): string {
  const withGerman = opts.umlauts ? replaceGermanUmlauts(input) : input;
  const stripped = stripCombiningMarks(withGerman);
  return opts.toLower ? stripped.toLowerCase() : stripped;
}
