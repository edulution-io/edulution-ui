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

import { Model } from 'mongoose';
import { ImapFlow, MailboxLockObject } from 'imapflow';
import { ArgumentMetadata, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import { Agent as HttpsAgent } from 'https';
import {
  CreateSyncJobDto,
  MailDto,
  MailProviderConfigDto,
  SogoThemeVersionDto,
  SyncJobDto,
  SyncJobResponseDto,
} from '@libs/mail/types';
import MailsErrorMessages from '@libs/mail/constants/mails-error-messages';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import DOCKER_CONTAINER_NAMES from '@libs/docker/constants/dockerContainerNames';
import MailTheme from '@libs/mail/constants/mailTheme';
import SOGO_THEME from '@libs/mail/constants/sogoTheme';
import { extractTheme, extractVersion } from '@libs/mail/utils/sogoThemeMetadata';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import SseMessageType from '@libs/common/types/sseMessageType';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import CustomHttpException from '../common/CustomHttpException';
import DockerService from '../docker/docker.service';
import FilesystemService from '../filesystem/filesystem.service';
import { MailProvider, MailProviderDocument } from './mail-provider.schema';
import FilterUserPipe from '../common/pipes/filterUser.pipe';
import AppConfigService from '../appconfig/appconfig.service';
import GroupsService from '../groups/groups.service';
import SseService from '../sse/sse.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

const { MAILCOW_API_URL, MAILCOW_API_TOKEN, EDUI_MAIL_IMAP_TIMEOUT } = process.env;

const connectionTimeout = EDUI_MAIL_IMAP_TIMEOUT ? parseInt(EDUI_MAIL_IMAP_TIMEOUT, 10) : 5000;

@Injectable()
class MailsService implements OnModuleInit {
  private mailcowApi: AxiosInstance;

  private imapClient: ImapFlow;

  private imapUrl: string;

  private imapPort: number;

  private imapSecure: boolean;

  private imapRejectUnauthorized: boolean;

  constructor(
    @InjectModel(MailProvider.name) private mailProviderModel: Model<MailProviderDocument>,
    private readonly appConfigService: AppConfigService,
    private readonly dockerService: DockerService,
    private readonly filesystemService: FilesystemService,
    private readonly groupsService: GroupsService,
    private readonly sseService: SseService,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {
    const httpsAgent = new HttpsAgent({
      rejectUnauthorized: false,
    });
    this.mailcowApi = axios.create({
      baseURL: `${MAILCOW_API_URL}/api/v1`,
      headers: {
        [HTTP_HEADERS.XApiKey]: MAILCOW_API_TOKEN,
        [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
      },
      httpsAgent,
    });
  }

  onModuleInit() {
    void this.updateImapConfig();
    Logger.debug(`Imap connection timeout: ${connectionTimeout}`, MailsService.name);
  }

  @OnEvent(`${EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED}-${APPS.MAIL}`)
  async updateImapConfig() {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.MAIL);

    if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
      return;
    }

    this.imapUrl = (appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_URL] as string) || '';
    this.imapPort = (appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_PORT] as number) || 0;
    this.imapSecure = !!appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_SECURE];
    this.imapRejectUnauthorized = !!appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED];

    Logger.verbose(
      `IMAP config: ${JSON.stringify({
        imapUrl: this.imapUrl,
        imapPort: this.imapPort,
        imapSecure: this.imapSecure,
        imapRejectUnauthorized: this.imapRejectUnauthorized,
      })}`,
      MailsService.name,
    );
  }

  private async getThemeConfig(): Promise<{
    theme: string;
    isLight: boolean;
    sourceUrl: string;
    accessGroups: { path: string }[];
  } | null> {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.MAIL);
    const extendedOptions = appConfig?.extendedOptions;

    if (!extendedOptions || typeof extendedOptions !== 'object') {
      return null;
    }

    const accessGroups = appConfig?.accessGroups ?? [];
    const themeRaw = (extendedOptions[ExtendedOptionKeys.MAIL_SOGO_THEME] as string) ?? MailTheme.DARK;
    const theme = themeRaw.toLowerCase();
    const isLight = theme === MailTheme.LIGHT;
    const sourceUrl = isLight ? SOGO_THEME.LIGHT_CSS_URL : SOGO_THEME.DARK_CSS_URL;

    return { theme, isLight, sourceUrl, accessGroups };
  }

  @OnEvent(`${EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED}-${APPS.MAIL}`)
  async updateSogoTheme() {
    try {
      const themeConfig = await this.getThemeConfig();
      if (!themeConfig) return;

      const { theme, sourceUrl, accessGroups } = themeConfig;

      const requiredContainer = DOCKER_CONTAINER_NAMES.MAILCOWDOCKERIZED_SOGO_MAILCOW_1;
      const containers = await this.dockerService.getContainers([requiredContainer]);
      const isRunning = Array.isArray(containers) && containers.some((c) => c.State === DOCKER_STATES.RUNNING);
      if (!isRunning) {
        Logger.debug(
          `Skipping SOGo theme update because container '${requiredContainer}' is not running`,
          MailsService.name,
        );
        return;
      }

      const response = await axios.get<string>(sourceUrl, { responseType: 'text' });
      const newCss = response.data ?? '';

      const targetPath = `${SOGO_THEME.TARGET_DIR}/${SOGO_THEME.TARGET_FILE_NAME}`;

      if (!(await MailsService.shouldWriteNewCss(targetPath, newCss))) {
        Logger.debug(`SOGo theme unchanged; skipping update at ${targetPath}`, MailsService.name);
        return;
      }

      await this.filesystemService.ensureDirectoryExists(SOGO_THEME.TARGET_DIR);
      await FilesystemService.writeFile(targetPath, newCss);
      Logger.debug(`SOGo theme updated to '${theme}' at ${targetPath}`, MailsService.name);

      const containersToRestart = [
        DOCKER_CONTAINER_NAMES.MAILCOWDOCKERIZED_MEMCACHED_MAILCOW_1,
        DOCKER_CONTAINER_NAMES.MAILCOWDOCKERIZED_SOGO_MAILCOW_1,
      ];
      await Promise.all(
        containersToRestart.map((id) =>
          this.dockerService.executeContainerCommand({ id, operation: DOCKER_COMMANDS.RESTART }),
        ),
      );

      await this.notifyMailThemeChange(accessGroups, SSE_MESSAGE_TYPE.MAIL_THEME_UPDATED, theme);
      Logger.log(`Restarted Mailcow containers to apply SOGo theme.`, MailsService.name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.notifyMailThemeChange(
        [{ path: GroupRoles.SUPER_ADMIN }],
        SSE_MESSAGE_TYPE.MAIL_THEME_UPDATE_FAILED,
        errorMessage,
      );
      Logger.error(`Failed to update SOGo theme: ${errorMessage}`, MailsService.name);
    }
  }

  async checkSogoThemeVersion(): Promise<SogoThemeVersionDto> {
    const result: SogoThemeVersionDto = {
      currentVersion: undefined,
      latestVersion: undefined,
      currentTheme: undefined,
      latestTheme: undefined,
      isUpdateAvailable: false,
    };

    try {
      const themeConfig = await this.getThemeConfig();
      if (!themeConfig) {
        return result;
      }

      const { sourceUrl } = themeConfig;

      const targetPath = `${SOGO_THEME.TARGET_DIR}/${SOGO_THEME.TARGET_FILE_NAME}`;
      const exists = await FilesystemService.checkIfFileExist(targetPath);

      if (exists) {
        const currentCss = (await FilesystemService.readFile(targetPath)).toString('utf-8');
        result.currentVersion = extractVersion(currentCss);
        result.currentTheme = extractTheme(currentCss);
      }

      const response = await axios.get<string>(sourceUrl, { responseType: 'text' });
      const latestCss = response.data ?? '';

      result.latestVersion = extractVersion(latestCss);
      result.latestTheme = extractTheme(latestCss);

      result.isUpdateAvailable = !!(
        result.currentVersion &&
        result.latestVersion &&
        result.currentVersion !== result.latestVersion
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to check SOGo theme version: ${errorMessage}`, MailsService.name);
      return result;
    }
  }

  private static async shouldWriteNewCss(targetPath: string, newCss: string): Promise<boolean> {
    const exists = await FilesystemService.checkIfFileExist(targetPath);
    if (!exists) return true;

    try {
      const currentCss = (await FilesystemService.readFile(targetPath)).toString('utf-8');

      if (currentCss.trim() === newCss.trim()) return false;

      const currentVersion = extractVersion(currentCss);
      const newVersion = extractVersion(newCss);
      const currentTheme = extractTheme(currentCss);
      const newTheme = extractTheme(newCss);

      const bothHeadersEqual =
        !!currentVersion &&
        !!newVersion &&
        !!currentTheme &&
        !!newTheme &&
        currentVersion === newVersion &&
        currentTheme === newTheme;

      return !bothHeadersEqual;
    } catch {
      return true;
    }
  }

  private async notifyMailThemeChange(
    accessGroups: { path: string }[],
    message: SseMessageType,
    data: string,
  ): Promise<void> {
    if (!Array.isArray(accessGroups) || accessGroups.length === 0) return;

    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    const usernames = await this.groupsService.getInvitedMembers(
      [...accessGroups, ...adminGroups.map((g) => ({ path: g }))],
      [],
    );

    if (!usernames.length) return;

    this.sseService.sendEventToUsers(usernames, data, message);
  }

  async getMails(emailAddress: string, password: string): Promise<MailDto[]> {
    if (!this.imapUrl || !this.imapPort) {
      return [];
    }

    this.imapClient = new ImapFlow({
      host: this.imapUrl,
      port: this.imapPort,
      secure: this.imapSecure,
      tls: {
        rejectUnauthorized: this.imapRejectUnauthorized,
      },
      auth: {
        user: emailAddress,
        pass: password,
      },
      logger: false,
      connectionTimeout,
    });

    this.imapClient.on('error', (err: Error): void => {
      Logger.error(`IMAP-Error: ${err.message}`, MailsService.name);
      void this.imapClient.logout();
      this.imapClient.close();
    });

    await this.imapClient.connect().catch((e) => {
      Logger.error(`IMAP-Connection-Error: ${e instanceof Error && e.message}`, MailsService.name);
      return [];
    });

    let mailboxLock: MailboxLockObject | undefined;
    const mails: MailDto[] = [];
    try {
      mailboxLock = await this.imapClient.getMailboxLock('INBOX');

      const fetchMail = this.imapClient.fetch({ recent: true }, { envelope: true, labels: true });

      // eslint-disable-next-line no-restricted-syntax
      for await (const mail of fetchMail) {
        const mailDto: MailDto = {
          id: mail.uid,
          subject: mail.envelope?.subject,
          labels: mail.labels,
        };
        mails.push(mailDto);
      }
    } catch (e) {
      Logger.error(`Get mails error: ${e instanceof Error && e.message}`, MailsService.name);
      return [];
    } finally {
      if (mailboxLock) {
        mailboxLock.release();
      }
    }
    await this.imapClient.logout();
    this.imapClient.close();

    Logger.verbose(`Feed: ${mails.length} new mails were fetched (imap)`, MailsService.name);
    return mails;
  }

  static prepareMailProviderResponse(mailProvidersList: MailProviderDocument[]): MailProviderConfigDto[] {
    const mailProviders: MailProviderConfigDto[] = mailProvidersList.map((item) => ({
      id: item.mailProviderId,
      name: item.name,
      label: item.label,
      host: item.host,
      port: item.port,
      encryption: item.encryption,
    }));

    return mailProviders;
  }

  async getExternalMailProviderConfig(): Promise<MailProviderConfigDto[]> {
    const mailProvidersList = await this.mailProviderModel.find({}, 'mailProviderId name label host port encryption');

    if (!mailProvidersList) {
      throw new CustomHttpException(
        MailsErrorMessages.MailProviderNotFound,
        HttpStatus.NOT_FOUND,
        '',
        MailsService.name,
      );
    }

    return MailsService.prepareMailProviderResponse(mailProvidersList);
  }

  async postExternalMailProviderConfig(mailProviderConfig: MailProviderConfigDto): Promise<MailProviderConfigDto[]> {
    try {
      let response = {};
      if (mailProviderConfig.id !== '') {
        response =
          (await this.mailProviderModel.findOneAndUpdate(
            { mailProviderId: mailProviderConfig.id },
            { $set: mailProviderConfig },
            { upsert: true },
          )) || {};
      } else {
        response = await this.mailProviderModel.create(mailProviderConfig);
      }
      if (response) {
        const mailProvidersList = await this.mailProviderModel.find(
          {},
          'mailProviderId name label host port encryption',
        );
        return MailsService.prepareMailProviderResponse(mailProvidersList);
      }
    } catch (error) {
      throw new CustomHttpException(
        MailsErrorMessages.MailProviderNotFound,
        HttpStatus.NOT_FOUND,
        error,
        MailsService.name,
      );
    }
    throw new CustomHttpException(MailsErrorMessages.MailProviderNotFound, HttpStatus.NOT_FOUND, '', MailsService.name);
  }

  async deleteExternalMailProviderConfig(mailProviderId: string) {
    try {
      const deleteResponse = await this.mailProviderModel.deleteOne({ mailProviderId });
      if (deleteResponse.deletedCount === 1) {
        const mailProvidersList = await this.mailProviderModel.find(
          {},
          'mailProviderId name label host port encryption',
        );
        return MailsService.prepareMailProviderResponse(mailProvidersList);
      }
    } catch (error) {
      throw new CustomHttpException(
        MailsErrorMessages.MailProviderNotFound,
        HttpStatus.NOT_FOUND,
        error,
        MailsService.name,
      );
    }
    throw new CustomHttpException(MailsErrorMessages.MailProviderNotFound, HttpStatus.NOT_FOUND, '', MailsService.name);
  }

  async getSyncJobs(emailAddress: string): Promise<SyncJobDto[]> {
    if (!MAILCOW_API_URL || !MAILCOW_API_TOKEN) {
      return [];
    }

    try {
      const syncJobs = await this.mailcowApi.get<SyncJobDto[]>('/get/syncjobs/all/no_log');

      const filteredSyncJobs = new FilterUserPipe(emailAddress).transform(syncJobs.data, {} as ArgumentMetadata);

      return filteredSyncJobs;
    } catch (error) {
      throw new CustomHttpException(MailsErrorMessages.MailcowApiGetSyncJobsFailed, HttpStatus.BAD_GATEWAY);
    }
  }

  async createSyncJob(createSyncJobDto: CreateSyncJobDto, emailAddress: string) {
    try {
      const response = await this.mailcowApi.post<SyncJobResponseDto>('/add/syncjob', createSyncJobDto);
      if (response) {
        const syncJobs = await this.getSyncJobs(emailAddress);
        return syncJobs;
      }
      throw new CustomHttpException(MailsErrorMessages.MailcowApiCreateSyncJobFailed, HttpStatus.BAD_GATEWAY);
    } catch (error) {
      throw new CustomHttpException(MailsErrorMessages.MailcowApiCreateSyncJobFailed, HttpStatus.BAD_GATEWAY);
    }
  }

  async deleteSyncJobs(syncJobIds: string[], emailAddress: string) {
    // NIEDUUI-374: Check if user has permission to delete
    try {
      const response = await this.mailcowApi.post<SyncJobResponseDto>('/delete/syncjob', syncJobIds);
      if (response) {
        const syncJobs = await this.getSyncJobs(emailAddress);
        return syncJobs;
      }
      throw new CustomHttpException(MailsErrorMessages.MailcowApiDeleteSyncJobsFailed, HttpStatus.BAD_GATEWAY);
    } catch (error) {
      throw new CustomHttpException(MailsErrorMessages.MailcowApiDeleteSyncJobsFailed, HttpStatus.BAD_GATEWAY);
    }
  }
}

export default MailsService;
