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

// This DTO is based on a third-party object definition from apache/guacamole.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
type ConnectionAttributes = {
  'guacd-encryption': string;
  'failover-only': string | null;
  weight: string | null;
  'max-connections': string;
  'guacd-hostname': string | null;
  'guacd-port': string | null;
  'max-connections-per-user': string;
};

type Connection = {
  name: string;
  identifier: string;
  parentIdentifier: string;
  protocol: string;
  attributes: ConnectionAttributes;
  activeConnections: number;
  lastActive: number;
};

type Connections = {
  [key: string]: Connection;
};

export default Connections;
