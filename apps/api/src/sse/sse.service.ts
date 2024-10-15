import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import SseEvent from '@libs/common/types/sseEvent';
import type UserConnections from '../types/userConnections';

type SseStatus = 'created' | 'updated' | 'started' | 'stopped' | 'deleted';

@Injectable()
class SseService {
  static subscribe(username: string, userConnections: UserConnections): Observable<MessageEvent> {
    if (!userConnections.has(username)) {
      userConnections.set(username, new Subject<SseEvent>());
    }

    const userConnection = userConnections.get(username);
    if (userConnection) {
      return userConnection.pipe(map((event: SseEvent) => ({ data: event.data }) as MessageEvent));
    }
    throw new Error(`User connection for ${username} is undefined.`);
  }

  static sendEventToUser(username: string, status: SseStatus, userConnections: UserConnections) {
    const userStream = userConnections.get(username);
    if (userStream) {
      userStream.next({ username, data: { message: status } });
    }
  }

  static sendEventToUsers(attendees: string[], status: SseStatus, userConnections: UserConnections) {
    attendees.forEach((username) => SseService.sendEventToUser(username, status, userConnections));
  }

  static informAllUsers(status: SseStatus, userConnections: UserConnections): void {
    userConnections.forEach((subject, username) => {
      subject.next({
        username,
        data: {
          message: status,
        },
      });
    });
  }
}

export default SseService;
