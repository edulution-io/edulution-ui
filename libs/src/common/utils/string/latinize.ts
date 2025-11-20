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
