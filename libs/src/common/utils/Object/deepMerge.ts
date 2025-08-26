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

type PlainObject = Record<string, unknown>;

const deepMerge = <T>(target: T | null | undefined, source: Partial<T> | null | undefined): T => {
  if (source == null || target === source) {
    return target as T;
  }

  if (target == null || typeof target !== 'object' || typeof source !== 'object') {
    return source as T;
  }

  if (Array.isArray(target) || Array.isArray(source)) {
    return source as T;
  }

  const out = { ...(target as unknown as PlainObject) } as PlainObject;
  const src = source as unknown as PlainObject;

  Object.keys(src).forEach((key) => {
    const v = src[key];
    if (v === undefined) {
      return;
    }
    out[key] = deepMerge(out[key] as T, v as Partial<T>);
  });

  return out as T;
};

export default deepMerge;
