import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type SseStatus from '@libs/common/types/sseMessageType';
import type UserConnections from '../types/userConnections';
import type SseEvent from '../types/sseEvent';
import type SseEventData from '../types/sseEventData';

@Injectable()
class SseService {
  static subscribe(username: string, userConnections: UserConnections, res: Response): Observable<MessageEvent> {
    const subject = new Subject<SseEvent>();

    if (!userConnections.has(username)) {
      userConnections.set(username, []);
    }

    userConnections.get(username)?.push(subject);

    res.on('close', () => {
      const connections = userConnections.get(username);
      if (connections) {
        const index = connections.indexOf(subject);
        if (index !== -1) {
          connections.splice(index, 1);
        }
        if (connections.length === 0) {
          userConnections.delete(username);
        }
      }
      subject.complete();
    });

    return subject.pipe(map((event: SseEvent) => ({ data: event.data, type: event.type }) as MessageEvent));
  }

  static sendEventToUser(
    username: string,
    userConnections: UserConnections,
    data: SseEventData,
    type: SseStatus = SSE_MESSAGE_TYPE.MESSAGE,
  ) {
    const userStreams = userConnections.get(username);
    if (userStreams) {
      userStreams.forEach((subject) => {
        subject.next({ username, type, data });
      });
    }
  }

  static sendEventToUsers(attendees: string[], userConnections: UserConnections, data: SseEventData, type: SseStatus) {
    attendees.forEach((username) => SseService.sendEventToUser(username, userConnections, data, type));
  }

  static informAllUsers(
    userConnections: UserConnections,
    data: SseEventData,
    type: SseStatus = SSE_MESSAGE_TYPE.MESSAGE,
  ): void {
    userConnections.forEach((subjects, username) => {
      subjects.forEach((subject) => {
        subject.next({
          username,
          type,
          data,
        });
      });
    });
  }
}

export default SseService;
