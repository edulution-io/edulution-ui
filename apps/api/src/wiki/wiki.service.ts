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

/* eslint-disable no-underscore-dangle */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpMethods } from '@libs/common/types/http-methods';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import WIKI_ERROR_MESSAGES from '@libs/wiki/constants/wikiErrorMessages';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import ContentType from '@libs/filesharing/types/contentType';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import type WikiRegistrationDto from '@libs/wiki/types/wikiRegistrationDto';
import type WikiPageDto from '@libs/wiki/types/wikiPageDto';
import type CreateWikiDto from '@libs/wiki/types/createWikiDto';
import type CreateWikiPageDto from '@libs/wiki/types/createWikiPageDto';
import type UpdateWikiPageDto from '@libs/wiki/types/updateWikiPageDto';
import { WikiRegistration, WikiRegistrationDocument } from './wiki-registration.schema';
import CustomHttpException from '../common/CustomHttpException';
import WebdavService from '../webdav/webdav.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

@Injectable()
class WikiService {
  constructor(
    @InjectModel(WikiRegistration.name) private wikiRegistrationModel: Model<WikiRegistrationDocument>,
    private readonly webdavService: WebdavService,
    private readonly webdavSharesService: WebdavSharesService,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  private async findRegistration(registrationId: string): Promise<WikiRegistrationDocument> {
    const registration = await this.wikiRegistrationModel.findById(registrationId);
    if (!registration) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.WIKI_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        registrationId,
        WikiService.name,
      );
    }
    return registration;
  }

  private async checkAccess(registration: WikiRegistrationDocument, userGroups: string[]): Promise<void> {
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();
    if (getIsAdmin(userGroups, adminGroups)) {
      return;
    }

    const accessibleShares = await this.webdavSharesService.findAllWebdavShares(userGroups);
    const shareNames = accessibleShares.map((s) => (typeof s === 'object' && 'displayName' in s ? s.displayName : ''));
    if (!shareNames.includes(registration.share)) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.ACCESS_DENIED,
        HttpStatus.FORBIDDEN,
        registration.share,
        WikiService.name,
      );
    }
  }

  async getAccessibleRegistrations(userGroups: string[]): Promise<WikiRegistrationDto[]> {
    const allRegistrations = await this.wikiRegistrationModel.find().lean();
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();
    const isAdmin = getIsAdmin(userGroups, adminGroups);

    let filtered = allRegistrations;
    if (!isAdmin) {
      const accessibleShares = await this.webdavSharesService.findAllWebdavShares(userGroups);
      const shareNames = new Set(
        accessibleShares.map((s) => (typeof s === 'object' && 'displayName' in s ? s.displayName : '')),
      );
      filtered = allRegistrations.filter((reg) => shareNames.has(reg.share));
    }

    return filtered.map((reg) => ({
      id: String(reg._id),
      name: reg.name,
      webdavPath: reg.webdavPath,
      share: reg.share,
      createdBy: reg.createdBy,
      createdAt: (reg as unknown as { createdAt: Date }).createdAt?.toISOString() ?? '',
      updatedAt: (reg as unknown as { updatedAt: Date }).updatedAt?.toISOString() ?? '',
    }));
  }

  async createWiki(dto: CreateWikiDto, username: string): Promise<WikiRegistrationDto> {
    let parentPath = dto.parentPath.replace(/\/+$/, '');
    if (parentPath.endsWith(`/${WIKI_CONSTANTS.WIKI_FOLDER_NAME}`)) {
      parentPath = parentPath.slice(0, -`/${WIKI_CONSTANTS.WIKI_FOLDER_NAME}`.length);
    }
    const webdavPath = `${parentPath}/${WIKI_CONSTANTS.WIKI_FOLDER_NAME}`;

    const existing = await this.wikiRegistrationModel.findOne({ webdavPath }).lean();
    if (existing) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.WIKI_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
        webdavPath,
        WikiService.name,
      );
    }

    try {
      await this.webdavService.ensureFolderExists(username, parentPath, WIKI_CONSTANTS.WIKI_FOLDER_NAME, dto.share);
    } catch (error) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.WIKI_CREATION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
        WikiService.name,
      );
    }

    const created = await this.wikiRegistrationModel.create({
      name: dto.name,
      webdavPath,
      share: dto.share,
      createdBy: username,
    });

    try {
      await this.writeFileContent(username, created, WIKI_CONSTANTS.INDEX_PAGE_NAME, `# ${dto.name}\n`);
    } catch (error) {
      Logger.warn(`Failed to create index page: ${(error as Error).message}`, WikiService.name);
    }

    return {
      id: String(created._id),
      name: created.name,
      webdavPath: created.webdavPath,
      share: created.share,
      createdBy: created.createdBy,
      createdAt: (created as unknown as { createdAt: Date }).createdAt?.toISOString() ?? '',
      updatedAt: (created as unknown as { updatedAt: Date }).updatedAt?.toISOString() ?? '',
    };
  }

  async updateWiki(id: string, name: string, userGroups: string[]): Promise<WikiRegistrationDto> {
    const registration = await this.findRegistration(id);
    await this.checkAccess(registration, userGroups);

    registration.name = name;
    await registration.save();

    return {
      id: String(registration._id),
      name: registration.name,
      webdavPath: registration.webdavPath,
      share: registration.share,
      createdBy: registration.createdBy,
      createdAt: (registration as unknown as { createdAt: Date }).createdAt?.toISOString() ?? '',
      updatedAt: (registration as unknown as { updatedAt: Date }).updatedAt?.toISOString() ?? '',
    };
  }

  async deleteWiki(id: string, username: string, userGroups: string[]): Promise<void> {
    const registration = await this.findRegistration(id);
    await this.checkAccess(registration, userGroups);

    try {
      const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(registration.share);
      const pathWithoutWebdav = getPathWithoutWebdav(registration.webdavPath, webdavShare.pathname);
      await this.webdavService.deletePath(username, pathWithoutWebdav, registration.share);
    } catch (error) {
      Logger.warn(`Failed to delete WebDAV folder: ${(error as Error).message}`, WikiService.name);
    }

    await this.wikiRegistrationModel.deleteOne({ _id: registration._id });
    Logger.log(`Wiki deleted: ${registration.name}`, WikiService.name);
  }

  async getPages(registrationId: string, username: string, userGroups: string[]): Promise<WikiPageDto[]> {
    const registration = await this.findRegistration(registrationId);
    await this.checkAccess(registration, userGroups);

    const mdFiles = await this.scanForMarkdownFiles(username, registration.webdavPath, registration.share);
    return mdFiles
      .filter((f) => f.relativePath !== WIKI_CONSTANTS.INDEX_PAGE_NAME)
      .map((f) => ({
        title: WikiService.titleFromFilename(f.relativePath),
        relativePath: f.relativePath,
      }))
      .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  }

  async createPage(
    registrationId: string,
    dto: CreateWikiPageDto,
    username: string,
    userGroups: string[],
  ): Promise<WikiPageDto> {
    const registration = await this.findRegistration(registrationId);
    await this.checkAccess(registration, userGroups);

    const fileName = `${dto.title.replace(/[^a-zA-Z0-9_-]/g, '-')}${WIKI_CONSTANTS.MARKDOWN_EXTENSION}`;

    try {
      await this.writeFileContent(username, registration, fileName, dto.content || '');
    } catch (error) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.PAGE_CREATION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
        WikiService.name,
      );
    }

    Logger.log(`Wiki page created: ${fileName} in ${registration.name}`, WikiService.name);

    return {
      title: dto.title,
      relativePath: fileName,
    };
  }

  async getPageContent(
    registrationId: string,
    relativePath: string,
    username: string,
    userGroups: string[],
  ): Promise<string> {
    const registration = await this.findRegistration(registrationId);
    await this.checkAccess(registration, userGroups);

    try {
      return await this.readFileContent(username, registration, relativePath);
    } catch (error) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.CONTENT_READ_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
        WikiService.name,
      );
    }
  }

  async updatePage(
    registrationId: string,
    relativePath: string,
    dto: UpdateWikiPageDto,
    username: string,
    userGroups: string[],
  ): Promise<WikiPageDto> {
    const registration = await this.findRegistration(registrationId);
    await this.checkAccess(registration, userGroups);

    const isIndexPage = relativePath === WIKI_CONSTANTS.INDEX_PAGE_NAME;
    let newRelativePath = relativePath;

    if (dto.title && !isIndexPage) {
      const newFileName = `${dto.title.replace(/[^a-zA-Z0-9_-]/g, '-')}${WIKI_CONSTANTS.MARKDOWN_EXTENSION}`;
      if (newFileName !== relativePath) {
        newRelativePath = newFileName;
      }
    }

    try {
      await this.writeFileContent(username, registration, newRelativePath, dto.content);
    } catch (error) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.PAGE_UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
        WikiService.name,
      );
    }

    if (newRelativePath !== relativePath) {
      try {
        await this.deleteFile(username, registration, relativePath);
      } catch (error) {
        Logger.warn(`Could not delete old file after rename: ${(error as Error).message}`, WikiService.name);
      }
    }

    if (isIndexPage) {
      const titleMatch = dto.content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        registration.name = titleMatch[1].trim();
        await registration.save();
      }
    }

    Logger.log(`Wiki page updated: ${newRelativePath}`, WikiService.name);

    return {
      title: dto.title || WikiService.titleFromFilename(newRelativePath),
      relativePath: newRelativePath,
    };
  }

  async deletePage(
    registrationId: string,
    relativePath: string,
    username: string,
    userGroups: string[],
  ): Promise<void> {
    const registration = await this.findRegistration(registrationId);
    await this.checkAccess(registration, userGroups);

    try {
      await this.deleteFile(username, registration, relativePath);
    } catch (error) {
      throw new CustomHttpException(
        WIKI_ERROR_MESSAGES.PAGE_DELETION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
        WikiService.name,
      );
    }

    Logger.log(`Wiki page deleted: ${relativePath}`, WikiService.name);
  }

  private async resolveFileUrl(registration: WikiRegistrationDocument, relativePath: string): Promise<string> {
    const webdavPath = `${registration.webdavPath.replace(/\/+$/, '')}/${relativePath}`;
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(registration.share);
    const pathWithoutWebdav = getPathWithoutWebdav(webdavPath, webdavShare.pathname);
    return WebdavService.safeJoinUrl(webdavShare.url, pathWithoutWebdav).replace(/\/$/, '');
  }

  private async readFileContent(
    username: string,
    registration: WikiRegistrationDocument,
    relativePath: string,
  ): Promise<string> {
    const client = await this.webdavService.getClient(username, registration.share);
    const url = await this.resolveFileUrl(registration, relativePath);
    const response = await client.get(url);
    return typeof response.data === 'string' ? response.data : String(response.data);
  }

  private async writeFileContent(
    username: string,
    registration: WikiRegistrationDocument,
    relativePath: string,
    content: string,
  ): Promise<void> {
    const client = await this.webdavService.getClient(username, registration.share);
    const url = await this.resolveFileUrl(registration, relativePath);
    await client.request({
      method: HttpMethods.PUT,
      url,
      data: content,
      headers: { 'Content-Type': WIKI_CONSTANTS.MARKDOWN_CONTENT_TYPE },
    });
  }

  private async deleteFile(
    username: string,
    registration: WikiRegistrationDocument,
    relativePath: string,
  ): Promise<void> {
    const webdavPath = `${registration.webdavPath.replace(/\/+$/, '')}/${relativePath}`;
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(registration.share);
    const pathWithoutWebdav = getPathWithoutWebdav(webdavPath, webdavShare.pathname);
    await this.webdavService.deletePath(username, pathWithoutWebdav, registration.share);
  }

  private async scanForMarkdownFiles(
    username: string,
    basePath: string,
    share: string,
  ): Promise<{ relativePath: string }[]> {
    const results: { relativePath: string }[] = [];
    const normalizedBasePath = basePath.replace(/\/+$/, '');

    const scanDirectory = async (dirPath: string, relativeBase: string) => {
      try {
        const files = await this.webdavService.getFilesAtPath(username, `${dirPath}/`, share);

        const validFiles = files.filter((file) => {
          const fileName = file.filename || file.filePath?.split('/').pop() || '';
          return fileName && fileName !== WIKI_CONSTANTS.WIKI_FOLDER_NAME;
        });

        const directories = validFiles.filter((f) => f.type === ContentType.DIRECTORY);
        const mdFiles = validFiles.filter((f) => {
          const fileName = f.filename || f.filePath?.split('/').pop() || '';
          return f.type !== ContentType.DIRECTORY && fileName.endsWith(WIKI_CONSTANTS.MARKDOWN_EXTENSION);
        });

        mdFiles.forEach((file) => {
          const fileName = file.filename || file.filePath?.split('/').pop() || '';
          const rp = relativeBase ? `${relativeBase}/${fileName}` : fileName;
          results.push({ relativePath: rp });
        });

        await Promise.all(
          directories.map((dir) => {
            const dirName = dir.filename || dir.filePath?.split('/').pop() || '';
            const subRelative = relativeBase ? `${relativeBase}/${dirName}` : dirName;
            return scanDirectory(`${dirPath}/${dirName}`, subRelative);
          }),
        );
      } catch (error) {
        Logger.warn(`Failed to scan directory ${dirPath}: ${(error as Error).message}`, WikiService.name);
      }
    };

    await scanDirectory(normalizedBasePath, '');
    return results;
  }

  private static titleFromFilename(relativePath: string): string {
    const fileName = relativePath.split('/').pop() || relativePath;
    return fileName.replace(WIKI_CONSTANTS.MARKDOWN_EXTENSION, '').replace(/[-_]/g, ' ');
  }
}

export default WikiService;
