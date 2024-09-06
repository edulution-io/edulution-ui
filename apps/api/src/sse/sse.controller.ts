import { Controller, Get, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Public } from '../common/decorators/public.decorator';
import SseService from './sse.service';

@Controller('sse')
class SseController<T> {
  constructor(private readonly sseService: SseService<T>) {}

  @Public()
  @Get()
  @Sse()
  sse(): Observable<T> {
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
