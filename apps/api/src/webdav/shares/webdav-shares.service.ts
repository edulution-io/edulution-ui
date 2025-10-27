/* eslint-disable no-restricted-syntax */
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

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, PipelineStage } from 'mongoose';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import APPS from '@libs/appconfig/constants/apps';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import type WebdavShareHealthUpdate from '@libs/filesharing/types/webdavShareHealthUpdate';
import { WebdavShares, WebdavSharesDocument } from './webdav-shares.schema';
import CustomHttpException from '../../common/CustomHttpException';
import { AppConfig } from '../../appconfig/appconfig.schema';
import MigrationService from '../../migration/migration.service';
import webdavSharesMigrationList from './migrations/webdavSharesMigrationList';
import GlobalSettingsService from '../../global-settings/global-settings.service';

type WebdavShareCache = Record<string, { url: string; type: string; pathname: string }>;

@Injectable()
class WebdavSharesService implements OnModuleInit {
  private webdavShareCache: WebdavShareCache = {};

  constructor(
    @InjectModel(WebdavShares.name) private webdavSharesModel: Model<WebdavSharesDocument>,
    @InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>,
    private eventEmitter: EventEmitter2,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  async onModuleInit() {
    const count = await this.webdavSharesModel.countDocuments();

    if (count === 0) {
      const appConfig = await this.appConfigModel.findOne({ name: APPS.FILE_SHARING }).lean();

      let accessGroups: MultipleSelectorGroup[] = [];
      if (appConfig && appConfig.accessGroups) {
        accessGroups = appConfig.accessGroups;
      }

      let pathname = '';
      const rawUrl = process.env.EDUI_WEBDAV_URL;

      if (rawUrl) {
        try {
          pathname = new URL(rawUrl).pathname;
        } catch (e) {
          Logger.warn('EDUI_WEBDAV_URL not valid', WebdavSharesService.name);
        }
      } else {
        Logger.warn('EDUI_WEBDAV_URL not set', WebdavSharesService.name);
      }

      await this.webdavSharesModel.create({
        displayName: WEBDAV_SHARE_TYPE.LINUXMUSTER,
        url: process.env.EDUI_WEBDAV_URL as string,
        isRootServer: true,
        pathname,
        accessGroups,
        type: WEBDAV_SHARE_TYPE.LINUXMUSTER,
        schemaVersion: 1,
      });
    }

    await MigrationService.runMigrations<WebdavSharesDocument>(this.webdavSharesModel, webdavSharesMigrationList);

    await this.loadCache();
  }

  private async loadCache(): Promise<void> {
    const webdavShares = await this.webdavSharesModel.find({}).lean();

    this.webdavShareCache = webdavShares.reduce<WebdavShareCache>((acc, share) => {
      acc[share.displayName] = { url: share.url, type: share.type, pathname: share.pathname };
      return acc;
    }, {});
  }

  async getWebdavShareFromCache(share: string) {
    if (!this.webdavShareCache[share]) {
      await this.loadCache();
    }
    return this.webdavShareCache[share];
  }

  async findAllWebdavShares(currentUserGroups: string[]) {
    try {
      const basePipeline: PipelineStage[] = [];

      const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

      if (!getIsAdmin(currentUserGroups, adminGroups)) {
        basePipeline.push({
          $match: {
            'accessGroups.path': { $in: currentUserGroups },
          },
        });
      }

      basePipeline.push({
        $match: { isRootServer: false },
      });

      basePipeline.push({
        $project: {
          webdavShareId: '$_id',
          _id: 0,
          displayName: 1,
          url: 1,
          sharePath: 1,
          pathname: 1,
          isRootServer: 1,
          rootServer: 1,
          pathVariables: 1,
          accessGroups: 1,
          type: 1,
          status: 1,
          lastChecked: 1,
          authentication: 1,
        },
      });

      const webdavShares = await this.webdavSharesModel.aggregate<WebdavShareDto>(basePipeline);

      const rootServers = await this.findAllWebdavServers();

      const rootServerMap = new Map(rootServers.map((s) => [String(s.webdavShareId), s]));

      const resolvedShares = webdavShares.map((share) => {
        if (share.rootServer && share.rootServer !== '') {
          const root = rootServerMap.get(String(share.rootServer));
          if (root) {
            return {
              ...share,
              url: root.url,
              type: root.type,
              status: root.status,
              lastChecked: root.lastChecked,
              authentication: root.authentication,
            };
          }
        }
        return this.webdavSharesModel.aggregate<WebdavShareDto>(basePipeline);
      });

      return resolvedShares;
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WebdavSharesService.name,
      );
    }
  }

  findAllWebdavServers() {
    try {
      const basePipeline: PipelineStage[] = [];

      basePipeline.push({
        $match: { isRootServer: true },
      });

      basePipeline.push({
        $project: {
          webdavShareId: '$_id',
          _id: 0,
          displayName: 1,
          url: 1,
          sharePath: 1,
          pathname: 1,
          isRootServer: 1,
          rootServer: 1,
          pathVariables: 1,
          accessGroups: 1,
          type: 1,
          status: 1,
          lastChecked: 1,
          authentication: 1,
        },
      });

      return this.webdavSharesModel.aggregate<WebdavShareDto>(basePipeline);
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WebdavSharesService.name,
      );
    }
  }

  async createWebdavShare(webdavShareDto: WebdavShareDto) {
    try {
      const created = await this.webdavSharesModel.create(webdavShareDto);
      await this.loadCache();
      return created;
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WebdavSharesService.name,
      );
    } finally {
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.WEBDAV_BASEURL_CHANGED);
    }
  }

  async updateWebdavShare(webdavShareId: string, webdavShareDto: WebdavShareDto | WebdavShareHealthUpdate) {
    try {
      const webdavShare = await this.webdavSharesModel.updateOne({ _id: webdavShareId }, webdavShareDto).exec();

      if (webdavShare.matchedCount === 0) {
        throw new Error(`WebDAV share with ID ${webdavShareId} not found`);
      }

      await this.loadCache();

      return webdavShare;
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.NOT_FOUND,
        error instanceof Error ? error.message : error,
        WebdavSharesService.name,
      );
    } finally {
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.WEBDAV_BASEURL_CHANGED);
    }
  }

  async deleteWebdavShare(webdavShareId: string): Promise<void> {
    try {
      Logger.log(`Deleting WebDAV share with ID: ${webdavShareId}`);
      await this.webdavSharesModel.deleteOne({ _id: webdavShareId }).exec();
      await this.loadCache();
      Logger.log(`WebDAV share with ID: ${webdavShareId} deleted successfully`);
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.NOT_FOUND,
        error,
        WebdavSharesService.name,
      );
    } finally {
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.WEBDAV_BASEURL_CHANGED);
    }
  }
}

export default WebdavSharesService;
