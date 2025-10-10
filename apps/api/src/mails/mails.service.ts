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

import { Model } from 'mongoose';
import { ImapFlow, MailboxLockObject } from 'imapflow';
import { ArgumentMetadata, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import { Agent as HttpsAgent } from 'https';
import { CreateSyncJobDto, MailDto, MailProviderConfigDto, SyncJobDto, SyncJobResponseDto } from '@libs/mail/types';
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
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import CustomHttpException from '../common/CustomHttpException';
import DockerService from '../docker/docker.service';
import FilesystemService from '../filesystem/filesystem.service';
import { MailProvider, MailProviderDocument } from './mail-provider.schema';
import FilterUserPipe from '../common/pipes/filterUser.pipe';
import AppConfigService from '../appconfig/appconfig.service';

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

  @OnEvent(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED)
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

  @OnEvent(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED)
  async updateSogoTheme() {
    try {
      const extendedOptions = (await this.appConfigService.getAppConfigByName(APPS.MAIL))?.extendedOptions;
      if (!extendedOptions || typeof extendedOptions !== 'object') return;

      const themeRaw = (extendedOptions[ExtendedOptionKeys.MAIL_SOGO_THEME] as string) ?? MailTheme.DARK;
      const theme = themeRaw.toLowerCase();
      const isLight = theme === MailTheme.LIGHT;

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

      const sourceUrl = isLight ? SOGO_THEME.LIGHT_CSS_URL : SOGO_THEME.DARK_CSS_URL;
      const response = await axios.get<string>(sourceUrl, { responseType: 'text' });
      const newCss = response.data ?? '';

      const targetPath = `${SOGO_THEME.TARGET_DIR}/${SOGO_THEME.TARGET_FILE_NAME}`;

      if (!(await this.shouldWriteNewCss(targetPath, newCss))) {
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
      Logger.log(`Restarted Mailcow containers to apply SOGo theme.`, MailsService.name);
    } catch (error) {
      Logger.error(
        `Failed to update SOGo theme: ${error instanceof Error ? error.message : String(error)}`,
        MailsService.name,
      );
    }
  }

  private async shouldWriteNewCss(targetPath: string, newCss: string): Promise<boolean> {
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
