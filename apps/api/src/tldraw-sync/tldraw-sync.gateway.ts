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
import TLDrawSyncService from './tldraw-sync.service';
import Attendee from '../conferences/attendee.schema';
import TLDRAW_MULTI_USER_ROOM_PREFIX from '@libs/whiteboard/constants/tldrawMultiUserRoomPrefix';
import TLDRAW_SINGLE_USER_ROOM_PREFIX from '@libs/whiteboard/constants/tldrawSingleUserRoomPrefix';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';

@WebSocketGateway({
  path: `${EDU_API_ROOT}/${TLDRAW_SYNC_ENDPOINTS.BASE}`,
  cors: { origin: '*' },
})
export default class TLDrawSyncGateway implements OnGatewayConnection, OnModuleInit {
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

    Logger.log(
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
        const parsed = this.parseDiff(message);
        if (!parsed) return;

        batch.push(parsed);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(flushBatch, 1000);
      };

      client.on('message', logListener);
      client.on('close', () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        void flushBatch();
      });
    }

    const caught: RawData[] = [];
    const collectListener = (msg: RawData) => caught.push(msg);
    client.on('message', collectListener);

    let room;
    try {
      room = await this.tldrawSyncService.makeOrLoadRoom(roomId);
    } catch (err) {
      client.off('message', collectListener);
      Logger.error(`Error loading room ${roomId}: ${(err as Error).message}`, TLDrawSyncGateway.name);
      client.close();
      return;
    }

    try {
      room.handleSocketConnect({ sessionId, socket: client });
    } catch (err) {
      client.off('message', collectListener);
      Logger.error(
        `Error in handleSocketConnect for room ${roomId}: ${(err as Error).message}`,
        TLDrawSyncGateway.name,
      );
      client.close();
      return;
    }

    client.off('message', collectListener);
    for (const msg of caught) {
      client.emit('message', msg);
    }
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

        if (!permittedUsers.some((user) => user.username === username)) {
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

  private parseDiff(message: RawData): Record<string, unknown> | null {
    let msg: any;
    try {
      msg = JSON.parse(message.toString());
    } catch {
      return null;
    }
    return msg.diff === undefined ? null : msg;
  }
}
