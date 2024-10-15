import { Subject } from 'rxjs';
import SseEvent from './sseEvent';

type UserConnections = Map<string, Subject<SseEvent>>;

export default UserConnections;
