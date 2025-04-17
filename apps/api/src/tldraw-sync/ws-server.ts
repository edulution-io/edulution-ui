import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import cors from '@fastify/cors';
import { Logger } from '@nestjs/common';
import type TldrawSyncService from './tldraw-sync.service';

export function startWSServer(tldrawSyncService: TldrawSyncService) {
  const logger = new Logger('FastifyWS');

  const app = fastify();
  app.register(websocketPlugin);
  app.register(cors, { origin: '*' });

  app.register(async (app) => {
    app.get('/connect/:roomId', { websocket: true }, async (socket, req) => {
      const roomId = (req.params as any).roomId as string;
      const sessionId = (req.query as any)?.['sessionId'] as string;
      console.log(`roomId ${JSON.stringify(roomId, null, 2)}`);
      console.log(`sessionId ${JSON.stringify(sessionId, null, 2)}`);
      const room = await tldrawSyncService.makeOrLoadRoom(roomId);
      room.handleSocketConnect({ sessionId, socket });
    });
  });

  const WS_PORT = Number(process.env.TLDRAW_WS_PORT) || 3003;

  app.listen({ port: WS_PORT }, (err) => {
    if (err) {
      logger.error(`Error starting WS server: ${err}`);
      process.exit(1);
    }
    logger.log(`Tldraw WS server is running on port ${WS_PORT}`);
  });
}
