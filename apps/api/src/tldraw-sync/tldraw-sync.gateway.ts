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

import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import TldrawSyncService from './tldraw-sync.service';

@WebSocketGateway({
  path: `/${TLDRAW_SYNC_ENDPOINTS.BASE}`,
  cors: { origin: '*' },
})
export default class TldrawSyncGateway implements OnGatewayConnection, OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly tldrawSyncService: TldrawSyncService) {}

  onModuleInit() {
    Logger.log(`WebSocket Gateway initialized at path: /${TLDRAW_SYNC_ENDPOINTS.BASE}`, TldrawSyncGateway.name);
  }

  async handleConnection(client: WebSocket, request: Request) {
    if (!request.url) {
      Logger.log('No URL in websocket request', TldrawSyncGateway.name);
      client.close();
      return;
    }

    const url = new URL(request.url, 'http://localhost');

    const roomId = url.searchParams.get(ROOM_ID_PARAM);
    const sessionId = url.searchParams.get('sessionId');

    if (!roomId || !sessionId) {
      Logger.log('Missing roomId or sessionId, closing socket', TldrawSyncGateway.name);
      client.close();
      return;
    }

    Logger.log(`Client connected: roomId=${roomId}, sessionId=${sessionId}`, TldrawSyncGateway.name);

    const room = await this.tldrawSyncService.makeOrLoadRoom(roomId);

    room.handleSocketConnect({ sessionId, socket: client });
  }
}
