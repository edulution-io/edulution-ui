import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

interface CustomMessageEvent {
  type?: string;
  data: string;
}

@Injectable()
class SseService {
  private clients: Map<number, Subject<CustomMessageEvent>> = new Map();

  private clientIdCounter = 0;

  addClient(): { id: number; subject: Subject<CustomMessageEvent> } {
    const id = 1 + this.clientIdCounter;
    const subject = new Subject<CustomMessageEvent>();

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

  sendMessageToAllClients(message: string, event: string): void {
    this.clients.forEach((subject) => {
      subject.next({ type: event, data: message });
    });
  }

  sendMessageToClient(id: number, message: string, event: string): void {
    const client = this.clients.get(id);
    if (client) {
      client.next({ type: event, data: message });
    }
  }
}

export default SseService;
