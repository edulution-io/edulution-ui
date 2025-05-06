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
import { RawData, Server, WebSocket } from 'ws';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import { readFileSync } from 'fs';
import { JwtService } from '@nestjs/jwt';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import TldrawSyncService from './tldraw-sync.service';

@WebSocketGateway({
  path: `${EDU_API_ROOT}/${TLDRAW_SYNC_ENDPOINTS.BASE}`,
  cors: { origin: '*' },
})
export default class TldrawSyncGateway implements OnGatewayConnection, OnModuleInit {
  @WebSocketServer() server: Server;

  private readonly pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');

  constructor(
    private readonly tldrawSyncService: TldrawSyncService,
    private readonly jwtService: JwtService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  onModuleInit() {
    Logger.log(`WebSocket Gateway initialized at path: /${TLDRAW_SYNC_ENDPOINTS.BASE}`, TldrawSyncGateway.name);
  }

  async handleConnection(client: WebSocket, request: Request) {
    const url = new URL(request.url, 'http://localhost');

    const token = url.searchParams.get('token');
    const sessionId = url.searchParams.get('sessionId');
    if (!token || !sessionId) {
      client.close();
      return;
    }

    let user: JwtUser;
    try {
      user = await this.jwtService.verifyAsync<JwtUser>(token, {
        publicKey: this.pubKey,
        algorithms: ['RS256'],
      });
    } catch (err) {
      client.close();
      return;
    }

    const multiRoomId = url.searchParams.get(ROOM_ID_PARAM);
    const roomId = multiRoomId ? `multi-${multiRoomId}` : `single-${user.preferred_username}`;

    Logger.log(
      `Client ${user.preferred_username} connected: roomId=${roomId}, sessionId=${sessionId}`,
      TldrawSyncGateway.name,
    );

    const caughtMessages: RawData[] = [];
    const collectMessagesListener = (message: RawData) => {
      caughtMessages.push(message);
    };
    client.on('message', collectMessagesListener);

    let room;
    try {
      room = await this.tldrawSyncService.makeOrLoadRoom(roomId);
    } catch (err) {
      Logger.error(`Error loading room ${roomId}: ${(err as Error).message}`, TldrawSyncGateway.name);
      client.off('message', collectMessagesListener);
      client.close();
      return;
    }

    try {
      room.handleSocketConnect({ sessionId, socket: client });
    } catch (err) {
      Logger.error(`Error connecting to room ${roomId}: ${(err as Error).message}`, TldrawSyncGateway.name);
      client.off('message', collectMessagesListener);
      client.close();
      return;
    }

    client.off('message', collectMessagesListener);
    caughtMessages.forEach((message) => client.emit('message', message));
  }
}
