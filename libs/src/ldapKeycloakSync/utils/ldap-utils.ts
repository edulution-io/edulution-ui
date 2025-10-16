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

import { latinize } from '@libs/common/utils/string/latinize';

export function parseCnHumanName(cn: string): { first?: string; last?: string } {
  const raw = cn.trim();
  if (!raw) return {};
  if (raw.includes(',')) {
    const [last, rest] = raw.split(',', 2);
    const parts = rest.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    return { first, last: last.trim() };
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { first: parts[0] };
  return { first: parts[0], last: parts[parts.length - 1] };
}

export function cnToKeycloakCandidates(cn: string): string[] {
  const { first, last } = parseCnHumanName(cn);
  if (!first || !last) return [];
  const f = latinize(first.toLowerCase()).replace(/[^a-z0-9-]/g, '');
  const l = latinize(last.toLowerCase()).replace(/[^a-z0-9-]/g, '');
  return Array.from(new Set([`${f}.${l}`, `${f}${l}`, `${f[0]}.${l}`, `${f}.${l[0]}`])).filter(Boolean);
}

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function usernameMatchesBaseOrNumbered(username: string, base: string): boolean {
  const rx = new RegExp(`^${escapeRegExp(base)}\\d*$`, 'i');
  return rx.test(username);
}

export function extractDn(raw: string | string[] | Buffer | Buffer[]): string {
  return Array.isArray(raw) ? raw[0].toString() : raw.toString();
}

export function extractCn(dn: string): string | null {
  const match = /^CN=([^,]+)/i.exec(dn);
  return match ? match[1] : null;
}

export function parseGroupDn(groupDn: string): { groupPath: string; cn: string } {
  const match = /^CN=([^,]+)/i.exec(groupDn);
  if (!match) throw new Error(`Invalid DN: ${groupDn}`);
  const cn = match[1];
  return { groupPath: `/${cn}`, cn };
}

export const missKeyExact = (username: string) => `exact:${username.toLowerCase()}`;
export const missKeyBase = (base: string) => `base:${base.toLowerCase()}`;

export async function probeCandidatesWithNegativeCache<T>(
  candidates: string[],
  missSet: Set<string>,
  makeMissKey: (c: string) => string,
  finder: (c: string) => Promise<T | undefined>,
): Promise<T | undefined> {
  const unchecked = candidates.filter((c) => !missSet.has(makeMissKey(c)));
  if (!unchecked.length) return undefined;

  const results = await Promise.all(
    unchecked.map(async (c) => {
      const hit = await finder(c);
      if (!hit) missSet.add(makeMissKey(c));
      return hit;
    }),
  );

  const idx = results.findIndex(Boolean);
  return idx === -1 ? undefined : results[idx]!;
}

export function dedupeAddRemove(add: Set<string>, remove: Set<string>) {
  add.forEach((gid) => {
    if (remove.has(gid)) {
      add.delete(gid);
      remove.delete(gid);
    }
  });
}
