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

const collapseUrlPathSlashes = (url: string): string => {
  const indexOfQuestionMark = url.indexOf('?');
  if (indexOfQuestionMark === -1) {
    return url;
  }

  const indexOfFragmentSeparator = url.indexOf('#', indexOfQuestionMark + 1);

  const partBeforeQueryDelimiter = url.slice(0, indexOfQuestionMark + 1);
  const queryPortion = url.slice(
    indexOfQuestionMark + 1,
    indexOfFragmentSeparator === -1 ? undefined : indexOfFragmentSeparator,
  );
  const portionAfterQuery = indexOfFragmentSeparator === -1 ? '' : url.slice(indexOfFragmentSeparator);

  const placeholderForSchemeSeparator = '__DOUBLE_SLASH_AFTER_COLON__';
  const protectedQueryPortion = queryPortion.replace(/:\/\//g, `:${placeholderForSchemeSeparator}`);

  const collapsedQueryPortion = protectedQueryPortion.replace(/\/{2,}/g, '/');

  const restoredQueryPortion = collapsedQueryPortion.replace(new RegExp(placeholderForSchemeSeparator, 'g'), '//');

  return partBeforeQueryDelimiter + restoredQueryPortion + portionAfterQuery;
};

export default collapseUrlPathSlashes;
