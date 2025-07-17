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

import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { Interval } from '@nestjs/schedule';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type SseStatus from '@libs/common/types/sseMessageType';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import * as rootPackage from '../../../../package.json';
import type UserConnections from '../types/userConnections';
import type SseEvent from '../types/sseEvent';
import type SseEventData from '../types/sseEventData';

@Injectable()
class SseService {
  private userConnections: UserConnections = new Map();

  @Interval(25000)
  sendHeartbeat(): void {
    this.informAllUsers(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        version: rootPackage.version,
        target: process.env.EDUI_DEPLOYMENT_TARGET || DEPLOYMENT_TARGET.LINUXMUSTER,
      }),
      SSE_MESSAGE_TYPE.PING,
    );
  }

  public getUserConnection(username: string) {
    return this.userConnections.get(username);
  }

  public subscribe(username: string, res: Response): Observable<MessageEvent> {
    let subject = this.userConnections.get(username);
    if (!subject) {
      subject = new Subject<SseEvent>();
      this.userConnections.set(username, subject);
    }

    res.on('close', () => {
      this.userConnections.delete(username);
      subject.complete();
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
