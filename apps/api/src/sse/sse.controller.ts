import { Controller, Get, MessageEvent, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Public } from '../common/decorators/public.decorator';
import SseService from './sse.service';

@Controller('sse')
class SseController {
  constructor(private readonly sseService: SseService) {}

  @Public()
  @Get()
  @Sse()
  sse(): Observable<MessageEvent> {
    const { id, subject } = this.sseService.addClient();

    // Automatically handle client disconnects
    subject.subscribe({
      complete: () => {
        this.sseService.removeClient(id);
      },
    });

    return subject.asObservable();
  }
}

export default SseController;
