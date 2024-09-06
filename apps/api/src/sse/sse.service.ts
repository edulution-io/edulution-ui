import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
class SseService<T> {
  private clients: Map<number, Subject<T>> = new Map();

  private clientIdCounter = 0;

  addClient(): { id: number; subject: Subject<T> } {
    const id = 1 + this.clientIdCounter;
    const subject = new Subject<T>();

    this.clients.set(id, subject);

    return { id, subject };
  }

  removeClient(id: number): void {
    const client = this.clients.get(id);
    if (client) {
      client.complete();
      this.clients.delete(id);
    }
  }

  sendMessageToAllClients(message: T): void {
    this.clients.forEach((subject) => {
      subject.next(message);
    });
  }

  sendMessageToClient(id: number, message: T): void {
    const client = this.clients.get(id);
    if (client) {
      client.next(message);
    }
  }
}

export default SseService;
