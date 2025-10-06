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

const SOGO_THEME = {
  LIGHT_CSS_URL:
    'https://raw.githubusercontent.com/edulution-io/edulution-mail/refs/heads/main/build/templates/sogo/light-theme.css',
  DARK_CSS_URL:
    'https://raw.githubusercontent.com/edulution-io/edulution-mail/refs/heads/main/build/templates/sogo/custom-theme.css',
  TARGET_DIR: '/srv/docker/edulution-mail/mailcow/data/conf/sogo',
  TARGET_FILE_NAME: 'custom-theme.css',
} as const;

export default SOGO_THEME;
