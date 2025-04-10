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

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import AppConfigService from './appconfig.service';
import GetCurrentUserGroups from '../common/decorators/getUserGroups.decorator';
import AppConfigGuard from './appconfig.guard';
import { createAttachmentUploadOptions } from '../common/multer.utilities';

@ApiTags(EDU_API_CONFIG_ENDPOINTS.ROOT)
@ApiBearerAuth()
@Controller(EDU_API_CONFIG_ENDPOINTS.ROOT)
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  @UseGuards(AppConfigGuard)
  createConfig(@GetCurrentUserGroups() ldapGroups: string[], @Body() appConfigDto: AppConfigDto) {
    return this.appConfigService.insertConfig(appConfigDto, ldapGroups);
  }

  @Put(':name')
  @UseGuards(AppConfigGuard)
  updateConfig(
    @Param('name') name: string,
    @Body() appConfigDto: AppConfigDto,
    @GetCurrentUserGroups() ldapGroups: string[],
  ) {
    return this.appConfigService.updateConfig(name, appConfigDto, ldapGroups);
  }

  @Patch(':name')
  @UseGuards(AppConfigGuard)
  patchConfig(
    @Param('name') name: string,
    @Body() patchConfigDto: PatchConfigDto,
    @GetCurrentUserGroups() ldapGroups: string[],
  ) {
    return this.appConfigService.patchSingleFieldInConfig(name, patchConfigDto, ldapGroups);
  }

  @Get()
  getAppConfigs(@GetCurrentUserGroups() ldapGroups: string[]) {
    return this.appConfigService.getAppConfigs(ldapGroups);
  }

  @Delete(':name')
  @UseGuards(AppConfigGuard)
  deleteConfig(@Param('name') name: string, @GetCurrentUserGroups() ldapGroups: string[]) {
    return this.appConfigService.deleteConfig(name, ldapGroups);
  }

  @Get(EDU_API_CONFIG_ENDPOINTS.PROXYCONFIG)
  @UseGuards(AppConfigGuard)
  getConfigFile(@Query('filePath') filePath: string) {
    return this.appConfigService.getFileAsBase64(filePath);
  }

  @Post('files/:name')
  @UseGuards(AppConfigGuard)
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions(
        (req) => `${APPS_FILES_PATH}/${req.params.name}`,
        false,
        (_req, file) => file.originalname,
      ),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  uploadEmbeddedPageFiles(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    return res.status(200).json(file.filename);
  }

  @Get('files/:name/:filename')
  serveFiles(@Param('name') name: string, @Param('filename') filename: string, @Res() res: Response) {
    return this.appConfigService.serveFiles(name, filename, res);
  }
}

export default AppConfigController;
