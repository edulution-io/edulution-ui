import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
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
      userConnections.set(username, subject);
    }

    res.on('close', () => {
      userConnections.delete(username);
      subject.complete();
    });

    const userConnection = userConnections.get(username);
    if (userConnection) {
      return userConnection.pipe(map((event: SseEvent) => ({ data: event.data, type: event.type }) as MessageEvent));
    }
    throw new Error(`User connection for ${username} is undefined.`);
  }

  static sendEventToUser(
    username: string,
    userConnections: UserConnections,
    data: SseEventData,
    type: SseStatus = SSE_MESSAGE_TYPE.MESSAGE,
  ) {
    const userStream = userConnections.get(username);
    if (userStream) {
      userStream.next({ username, type, data });
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
    userConnections.forEach((subject, username) => {
      subject.next({
        username,
        type,
        data,
      });
    });
  }
}

export default SseService;
