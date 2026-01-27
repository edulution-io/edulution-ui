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

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ImapFlow } from 'imapflow';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import MAIL_IDLE_CONFIG from '@libs/mail/constants/mailIdleConfig';
import type MailNewMailNotificationDto from '@libs/mail/types/mailNewMailNotification.dto';
import AppConfigService from '../appconfig/appconfig.service';
import SseService from '../sse/sse.service';

interface IdleConnection {
  client: ImapFlow;
  username: string;
  email: string;
  password: string;
  previousMailCount: number;
  idleRestartTimer?: NodeJS.Timeout;
  reconnectAttempts: number;
}

interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  rejectUnauthorized: boolean;
}

const { EDUI_MAIL_IMAP_TIMEOUT, EDUI_MAIL_IDLE_MAX_CONNECTIONS } = process.env;
const connectionTimeout = EDUI_MAIL_IMAP_TIMEOUT ? parseInt(EDUI_MAIL_IMAP_TIMEOUT, 10) : 5000;
const maxConnections = EDUI_MAIL_IDLE_MAX_CONNECTIONS
  ? parseInt(EDUI_MAIL_IDLE_MAX_CONNECTIONS, 10)
  : MAIL_IDLE_CONFIG.DEFAULT_MAX_CONCURRENT_CONNECTIONS;

@Injectable()
class MailIdleService implements OnModuleInit, OnModuleDestroy {
  private idleConnections = new Map<string, IdleConnection>();

  private imapConfig: ImapConfig = {
    host: '',
    port: 0,
    secure: false,
    rejectUnauthorized: false,
  };

  constructor(
    private readonly sseService: SseService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async onModuleInit() {
    await this.updateImapConfig();
  }

  async onModuleDestroy() {
    await this.stopAllConnections();
  }

  @OnEvent(`${EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED}-${APPS.MAIL}`)
  async updateImapConfig() {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.MAIL);

    if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
      return;
    }

    const rawHost = (appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_URL] as string) || '';
    const host = rawHost.replace(/^https?:\/\//, '');

    this.imapConfig = {
      host,
      port: (appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_PORT] as number) || 0,
      secure: !!appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_SECURE],
      rejectUnauthorized: !!appConfig.extendedOptions[ExtendedOptionKeys.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED],
    };

    Logger.debug(
      `MailIdleService IMAP config updated: ${this.imapConfig.host}:${this.imapConfig.port}`,
      MailIdleService.name,
    );
  }

  async startIdle(username: string, email: string, password: string): Promise<void> {
    if (this.idleConnections.has(username)) {
      Logger.debug(`IDLE connection already exists for user: ${username}`, MailIdleService.name);
      return;
    }

    if (this.idleConnections.size >= maxConnections) {
      Logger.warn(
        `Max concurrent IDLE connections reached (${maxConnections}), skipping for: ${username}`,
        MailIdleService.name,
      );
      return;
    }

    if (!this.imapConfig.host || !this.imapConfig.port) {
      Logger.debug('IMAP configuration missing, skipping IDLE start', MailIdleService.name);
      return;
    }

    if (!email || !password) {
      Logger.debug('Email credentials missing, skipping IDLE start', MailIdleService.name);
      return;
    }

    try {
      await this.createIdleConnection(username, email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to start IDLE for user ${username}: ${errorMessage}`, MailIdleService.name);
    }
  }

  private async createIdleConnection(username: string, email: string, password: string): Promise<void> {
    const client = new ImapFlow({
      host: this.imapConfig.host,
      port: this.imapConfig.port,
      secure: this.imapConfig.secure,
      tls: {
        rejectUnauthorized: this.imapConfig.rejectUnauthorized,
      },
      auth: {
        user: email,
        pass: password,
      },
      logger: false,
      connectionTimeout,
    });

    const connection: IdleConnection = {
      client,
      username,
      email,
      password,
      previousMailCount: 0,
      reconnectAttempts: 0,
    };

    client.on('error', (err: Error) => {
      Logger.error(`IMAP IDLE error for ${username}: ${err.message}`, MailIdleService.name);
      void this.handleConnectionError(username);
    });

    client.on('close', () => {
      Logger.debug(`IMAP connection closed for ${username}`, MailIdleService.name);
      void this.handleConnectionError(username);
    });

    client.on('exists', (data: { path: string; count: number; prevCount: number }) => {
      this.handleExistsEvent(username, data.count, data.prevCount);
    });

    try {
      await client.connect();
      await client.mailboxOpen('INBOX');

      const mailboxStatus = client.mailbox;
      if (mailboxStatus) {
        connection.previousMailCount = mailboxStatus.exists || 0;
      }

      this.idleConnections.set(username, connection);
      this.scheduleIdleRestart(username);

      Logger.log(
        `IDLE started for user: ${username} (${connection.previousMailCount} mails, ${this.idleConnections.size}/${maxConnections} connections)`,
        MailIdleService.name,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to connect IDLE for ${username}: ${errorMessage}`, MailIdleService.name);
      await MailIdleService.cleanupClient(client);
      throw error;
    }
  }

  private handleExistsEvent(username: string, count: number, prevCount: number): void {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    if (count > prevCount) {
      const newMailCount = count - prevCount;
      Logger.log(`New mail detected for ${username}: ${newMailCount} new mail(s)`, MailIdleService.name);

      const notification: MailNewMailNotificationDto = {
        count,
        previousCount: prevCount,
        newMailCount,
      };

      this.sseService.sendEventToUser(username, notification, SSE_MESSAGE_TYPE.MAIL_NEW_MAIL);
    }

    connection.previousMailCount = count;
  }

  private scheduleIdleRestart(username: string): void {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    if (connection.idleRestartTimer) {
      clearTimeout(connection.idleRestartTimer);
    }

    connection.idleRestartTimer = setTimeout(() => {
      void this.restartIdle(username);
    }, MAIL_IDLE_CONFIG.IDLE_TIMEOUT_MS);
  }

  private async restartIdle(username: string): Promise<void> {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    Logger.debug(`Restarting IDLE for ${username} (timeout prevention)`, MailIdleService.name);

    const { email, password } = connection;
    await this.stopIdle(username);

    try {
      await this.createIdleConnection(username, email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to restart IDLE for ${username}: ${errorMessage}`, MailIdleService.name);
    }
  }

  private async handleConnectionError(username: string): Promise<void> {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    connection.reconnectAttempts += 1;

    if (connection.reconnectAttempts > MAIL_IDLE_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      Logger.warn(`Max reconnect attempts reached for ${username}, stopping IDLE`, MailIdleService.name);
      await this.stopIdle(username);
      return;
    }

    const delay = MAIL_IDLE_CONFIG.RECONNECT_DELAY_MS * connection.reconnectAttempts;
    Logger.debug(
      `Scheduling reconnect for ${username} in ${delay}ms (attempt ${connection.reconnectAttempts})`,
      MailIdleService.name,
    );

    const { email, password } = connection;
    await this.stopIdle(username);

    setTimeout(() => {
      void this.createIdleConnection(username, email, password).catch((error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.error(`Reconnect failed for ${username}: ${errorMessage}`, MailIdleService.name);
      });
    }, delay);
  }

  async stopIdle(username: string): Promise<void> {
    const connection = this.idleConnections.get(username);
    if (!connection) {
      return;
    }

    if (connection.idleRestartTimer) {
      clearTimeout(connection.idleRestartTimer);
    }

    await MailIdleService.cleanupClient(connection.client);
    this.idleConnections.delete(username);

    Logger.log(`IDLE stopped for user: ${username}`, MailIdleService.name);
  }

  @OnEvent(EVENT_EMITTER_EVENTS.SSE_USER_DISCONNECTED)
  async handleUserDisconnected(username: string): Promise<void> {
    if (this.idleConnections.has(username)) {
      Logger.debug(`User ${username} disconnected from SSE, stopping IDLE`, MailIdleService.name);
      await this.stopIdle(username);
    }
  }

  private async stopAllConnections(): Promise<void> {
    const usernames = Array.from(this.idleConnections.keys());
    await Promise.all(usernames.map((username) => this.stopIdle(username)));
    Logger.log(`All IDLE connections stopped (${usernames.length} connections)`, MailIdleService.name);
  }

  private static async cleanupClient(client: ImapFlow): Promise<void> {
    try {
      if (client?.usable) {
        await client.logout();
      }
    } catch (logoutError) {
      Logger.warn(
        `Failed to logout IMAP client: ${logoutError instanceof Error ? logoutError.message : String(logoutError)}`,
        MailIdleService.name,
      );
    } finally {
      try {
        client.close();
      } catch (closeError) {
        Logger.warn(
          `Failed to close IMAP client: ${closeError instanceof Error ? closeError.message : String(closeError)}`,
          MailIdleService.name,
        );
      }
    }
  }

  hasActiveConnection(username: string): boolean {
    return this.idleConnections.has(username);
  }

  getConnectionCount(): number {
    return this.idleConnections.size;
  }

  getConnectionStats(): { current: number; max: number } {
    return {
      current: this.idleConnections.size,
      max: maxConnections,
    };
  }
}

export default MailIdleService;
