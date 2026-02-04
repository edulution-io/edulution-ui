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

import { Inject, Injectable, MessageEvent, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { Interval } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type SseStatus from '@libs/common/types/sseMessageType';
import getDeploymentTarget from '@libs/common/utils/getDeploymentTarget';
import {
  SSE_HEARTBEAT_INTERVAL_MS,
  SSE_USER_CONNECTIONS_CACHE_KEY,
  SSE_PERSIST_DEBOUNCE_MS,
} from '@libs/sse/constants/sseConfig';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import type UserConnections from '../types/userConnections';
import type SseEvent from '../types/sseEvent';
import type SseEventData from '../types/sseEventData';

@Injectable()
class SseService implements OnModuleInit {
  private userConnections: UserConnections = new Map();

  private persistDebounceTimer: NodeJS.Timeout | null = null;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.restoreUserConnectionsFromCache();
  }

  private async persistUserConnectionsToCache(): Promise<void> {
    const usernames = Array.from(this.userConnections.keys());
    await this.cacheManager.set(SSE_USER_CONNECTIONS_CACHE_KEY, usernames, 0);
  }

  private debouncedPersistUserConnectionsToCache(): void {
    if (this.persistDebounceTimer) {
      clearTimeout(this.persistDebounceTimer);
    }
    this.persistDebounceTimer = setTimeout(() => {
      void this.persistUserConnectionsToCache();
    }, SSE_PERSIST_DEBOUNCE_MS);
  }

  private async restoreUserConnectionsFromCache(): Promise<void> {
    const usernames = await this.cacheManager.get<string[]>(SSE_USER_CONNECTIONS_CACHE_KEY);
    if (usernames && Array.isArray(usernames)) {
      usernames.forEach((username) => {
        if (!this.userConnections.has(username)) {
          this.userConnections.set(username, new Subject<SseEvent>());
        }
      });
    }
  }

  @Interval(SSE_HEARTBEAT_INTERVAL_MS)
  sendHeartbeat(): void {
    this.informAllUsers(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        version: this.configService.get<string>('version'),
        target: getDeploymentTarget(),
      }),
      SSE_MESSAGE_TYPE.PING,
    );
  }

  public getUserConnection(username: string) {
    return this.userConnections.get(username);
  }

  public subscribe(username: string, res: Response): Observable<MessageEvent> {
    let subject = this.userConnections.get(username);
    const isNewConnection = !subject;
    if (!subject) {
      subject = new Subject<SseEvent>();
      this.userConnections.set(username, subject);
      this.debouncedPersistUserConnectionsToCache();
    }

    if (isNewConnection) {
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.SSE_USER_CONNECTED, username);
    }

    res.on('close', () => {
      this.userConnections.delete(username);
      subject.complete();
      this.debouncedPersistUserConnectionsToCache();
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.SSE_USER_DISCONNECTED, username);
    });

    return subject.pipe(
      map((event: SseEvent) => ({
        data: event.data,
        type: event.type,
      })),
    );
  }

  public sendEventToUser(username: string, data: SseEventData, type: SseStatus = SSE_MESSAGE_TYPE.MESSAGE) {
    const subject = this.userConnections.get(username);
    if (subject) {
      subject.next({ username, type, data });
    }
  }

  public sendEventToUsers(attendees: string[], data: SseEventData, type: SseStatus) {
    attendees.forEach((username) => this.sendEventToUser(username, data, type));
  }

  public informAllUsers(data: SseEventData, type: SseStatus = SSE_MESSAGE_TYPE.MESSAGE): void {
    this.userConnections.forEach((subject, username) => {
      subject.next({
        username,
        type,
        data,
      });
    });
  }
}

export default SseService;
