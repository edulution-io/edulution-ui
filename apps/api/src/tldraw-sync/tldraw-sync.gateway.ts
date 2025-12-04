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

import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RawData, Server, WebSocket } from 'ws';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/tLDrawSyncEndpoints';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import { readFileSync } from 'fs';
import { JwtService } from '@nestjs/jwt';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import TLDRAW_MULTI_USER_ROOM_PREFIX from '@libs/whiteboard/constants/tldrawMultiUserRoomPrefix';
import TLDRAW_SINGLE_USER_ROOM_PREFIX from '@libs/whiteboard/constants/tldrawSingleUserRoomPrefix';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import Attendee from '../conferences/attendee.schema';
import TLDrawSyncService from './tldraw-sync.service';

@WebSocketGateway({
  path: `${EDU_API_ROOT}/${TLDRAW_SYNC_ENDPOINTS.BASE}`,
  cors: { origin: '*' },
})
class TLDrawSyncGateway implements OnGatewayConnection, OnModuleInit {
  @WebSocketServer() server: Server;

  private readonly pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');

  constructor(
    private readonly tldrawSyncService: TLDrawSyncService,
    private readonly jwtService: JwtService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  onModuleInit() {
    Logger.log(`TLDrawSyncGateway initialized at path: /${TLDRAW_SYNC_ENDPOINTS.BASE}`, TLDrawSyncGateway.name);
  }

  async handleConnection(client: WebSocket, request: Request) {
    const { attendee, roomId, sessionId, isMultiUserRoom, permittedUsers } = await this.authenticate(request, client);
    if (!attendee || !roomId || !sessionId) return;

    Logger.verbose(
      `Authenticated user ${attendee.username} connected: roomId=${roomId}, sessionId=${sessionId}`,
      TLDrawSyncGateway.name,
    );

    const batch: Record<string, unknown>[] = [];
    let debounceTimer: NodeJS.Timeout | undefined;

    if (isMultiUserRoom && permittedUsers?.length) {
      const flushBatch = async () => {
        if (batch.length === 0) return;
        try {
          await this.tldrawSyncService.logRoomMessage(
            {
              roomId,
              attendee,
              message: batch[batch.length - 1],
            },
            permittedUsers,
          );
        } catch (err) {
          Logger.error(`Error flushing batch: ${(err as Error).message}`, TLDrawSyncGateway.name);
        }
        batch.length = 0;
        debounceTimer = undefined;
      };

      const logListener = (message: RawData) => {
        const parsed = TLDrawSyncGateway.parseDiff(message);
        if (!parsed) return;

        batch.push(parsed);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          void flushBatch();
        }, 1000);
      };

      client.on('message', logListener);
      client.on('close', () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        void flushBatch();
      });
    }

    const caughtMessages: RawData[] = [];
    const collectMessagesListener = (message: RawData) => caughtMessages.push(message);
    client.on('message', collectMessagesListener);

    let room;
    try {
      room = await this.tldrawSyncService.makeOrLoadRoom(roomId);
    } catch (err) {
      client.off('message', collectMessagesListener);
      Logger.error(`Error loading room ${roomId}: ${(err as Error).message}`, TLDrawSyncGateway.name);
      client.close();
      return;
    }

    try {
      room.handleSocketConnect({ sessionId, socket: client });
    } catch (err) {
      client.off('message', collectMessagesListener);
      Logger.error(
        `Error in handleSocketConnect for room ${roomId}: ${(err as Error).message}`,
        TLDrawSyncGateway.name,
      );
      client.close();
      return;
    }

    client.off('message', collectMessagesListener);
    caughtMessages.forEach((message) => client.emit('message', message));
  }

  private async authenticate(
    request: Request,
    client: WebSocket,
  ): Promise<{
    attendee?: Attendee;
    roomId?: string;
    sessionId?: string;
    isMultiUserRoom?: boolean;
    permittedUsers?: GroupMemberDto[];
  }> {
    const url = new URL(request.url, 'http://localhost');
    const token = url.searchParams.get('token');
    const sessionId = url.searchParams.get('sessionId')!;

    if (!token || !sessionId) {
      client.close();
      return {};
    }

    try {
      const user = await this.jwtService.verifyAsync<JwtUser>(token, {
        publicKey: this.pubKey,
        algorithms: ['RS256'],
      });

      const { preferred_username: username, family_name: lastName, given_name: firstName } = user;

      const multiUserRoomId = url.searchParams.get(ROOM_ID_PARAM);
      const roomId = multiUserRoomId
        ? `${TLDRAW_MULTI_USER_ROOM_PREFIX}${multiUserRoomId}`
        : `${TLDRAW_SINGLE_USER_ROOM_PREFIX}${username}`;

      let permittedUsers;
      if (multiUserRoomId) {
        permittedUsers = await this.tldrawSyncService.getPermittedUsers(roomId);

        if (!permittedUsers.some((u) => u.username === username)) {
          return {};
        }
      }

      return {
        attendee: { username, firstName, lastName },
        roomId,
        sessionId,
        isMultiUserRoom: !!multiUserRoomId,
        permittedUsers,
      };
    } catch {
      client.close();

      return {};
    }
  }

  private static parseDiff(message: RawData): Record<string, unknown> | null {
    let str: string;
    if (Buffer.isBuffer(message)) {
      str = message.toString('utf8');
    } else if (message instanceof ArrayBuffer) {
      str = Buffer.from(message).toString('utf8');
    } else if (Array.isArray(message)) {
      str = Buffer.concat(message).toString('utf8');
    } else {
      return null;
    }

    try {
      const msg = JSON.parse(str) as Record<string, unknown>;
      return msg.diff === undefined ? null : msg;
    } catch {
      return null;
    }
  }
}

export default TLDrawSyncGateway;
