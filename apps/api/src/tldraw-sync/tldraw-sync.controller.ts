import { Controller, Get, Param, Put, RawBody, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import AuthGuard from '../auth/auth.guard';
import RateLimiterInterceptor from '../common/middleware/rate-limiter.interceptor';
import TldrawSyncService from './tldraw-sync.service';

@UseGuards(AuthGuard)
@Controller(TLDRAW_SYNC_ENDPOINTS.BASE)
class TldrawSyncController {
  constructor(private readonly tldrawSyncService: TldrawSyncService) {}

  @Put(`${TLDRAW_SYNC_ENDPOINTS.ASSETS}/:id`)
  @UseInterceptors(RateLimiterInterceptor)
  async storeAsset(@Param('id') id: string, @RawBody() rawBody: Buffer, @Res() res: Response) {
    await this.tldrawSyncService.storeAsset(id, rawBody);
    res.json({ ok: true });
  }

  @Get(`${TLDRAW_SYNC_ENDPOINTS.ASSETS}/:id`)
  async loadAsset(@Param('id') id: string, @Res() res: Response) {
    const assetStream = await this.tldrawSyncService.loadAsset(id);
    assetStream.pipe(res);
  }
}

export default TldrawSyncController;
