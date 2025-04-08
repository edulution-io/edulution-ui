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

import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';

const websocketProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const url = new URL(EDU_BASE_URL);

const WEBSOCKET_URL = `${websocketProtocol}://${url.host}/guacamole/websocket-tunnel`;

export default WEBSOCKET_URL;
