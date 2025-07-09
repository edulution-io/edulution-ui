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
import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow';
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
import CustomHttpException from '../common/CustomHttpException';
import { MailProvider, MailProviderDocument } from './mail-provider.schema';
import FilterUserPipe from '../common/pipes/filterUser.pipe';
import AppConfigService from '../appconfig/appconfig.service';

const { MAILCOW_API_URL, MAILCOW_API_TOKEN } = process.env;

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
      connectionTimeout: 5000,
    });

    this.imapClient.on('error', (err: Error): void => {
      Logger.error(`IMAP-Error: ${err.message}`, MailsService.name);
      void this.imapClient.logout();
      this.imapClient.close();
    });

    await this.imapClient.connect().catch((err) => {
      throw new CustomHttpException(
        MailsErrorMessages.NotAbleToConnectClientError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        err,
      );
    });

    let mailboxLock: MailboxLockObject | undefined;
    const mails: MailDto[] = [];
    try {
      mailboxLock = await this.imapClient.getMailboxLock('INBOX');

      const fetchMail: AsyncGenerator<FetchMessageObject> = this.imapClient.fetch(
        { recent: true },
        { envelope: true, labels: true },
      );

      // eslint-disable-next-line no-restricted-syntax
      for await (const mail of fetchMail) {
        const mailDto: MailDto = {
          id: mail.uid,
          subject: mail.envelope?.subject,
          labels: mail.labels,
        };
        mails.push(mailDto);
      }
    } catch (error) {
      throw new CustomHttpException(
        MailsErrorMessages.NotAbleToFetchMailsError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        emailAddress,
      );
    } finally {
      if (mailboxLock) {
        mailboxLock.release();
      }
    }
    await this.imapClient.logout();
    this.imapClient.close();

    Logger.log(`Feed: ${mails.length} new mails were fetched (imap)`, MailsService.name);
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
