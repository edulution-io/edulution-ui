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
import { Model, PipelineStage } from 'mongoose';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import APPS from '@libs/appconfig/constants/apps';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { WebdavShares, WebdavSharesDocument } from './webdav-shares.schema';
import CustomHttpException from '../../common/CustomHttpException';
import { AppConfig } from '../../appconfig/appconfig.schema';

@Injectable()
class WebdavSharesService implements OnModuleInit {
  private webdavShareCache: { url: string; type: string } | null = null;

  constructor(
    @InjectModel(WebdavShares.name) private webdavSharesModel: Model<WebdavSharesDocument>,
    @InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>,
  ) {}

  async onModuleInit() {
    const count = await this.webdavSharesModel.countDocuments();

    if (count === 0) {
      const appConfig = await this.appConfigModel.findOne({ name: APPS.FILE_SHARING }).lean();

      let accessGroups: MultipleSelectorGroup[] = [];
      if (appConfig && appConfig.accessGroups) {
        accessGroups = appConfig.accessGroups;
      }

      await this.webdavSharesModel.create({
        displayName: WEBDAV_SHARE_TYPE.LINUXMUSTER,
        url: process.env.EDUI_WEBDAV_URL as string,
        accessGroups,
        type: WEBDAV_SHARE_TYPE.LINUXMUSTER,
      });
    }
  }

  private async loadCache(): Promise<void> {
    const webdavShare = await this.webdavSharesModel.findOne().lean();
    if (webdavShare) {
      this.webdavShareCache = {
        url: webdavShare.url,
        type: webdavShare.type,
      };
    } else {
      this.webdavShareCache = null;
    }
  }

  async getWebdavSharePath(): Promise<string> {
    if (!this.webdavShareCache) {
      await this.loadCache();
    }
    return this.webdavShareCache?.url || '';
  }

  async getWebdavShareType(): Promise<string> {
    if (!this.webdavShareCache) {
      await this.loadCache();
    }
    return this.webdavShareCache?.type || '';
  }

  findAllWebdavShares(currentUserGroups: string[]) {
    try {
      const basePipeline: PipelineStage[] = [
        {
          $project: {
            webdavShareId: '$_id',
            _id: 0,
            displayName: 1,
            url: 1,
            accessGroups: 1,
            type: 1,
          },
        },
      ];

      if (!getIsAdmin(currentUserGroups)) {
        basePipeline.unshift({
          $match: {
            'accessGroups.path': { $in: currentUserGroups },
          },
        });
      }

      return this.webdavSharesModel.aggregate(basePipeline);
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
    }
  }

  async updateWebdavShare(webdavShareId: string, webdavShareDto: WebdavShareDto) {
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
    }
  }
}

export default WebdavSharesService;
