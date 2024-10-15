import { Subject } from 'rxjs';
import SseEvent from '@libs/common/types/sseEvent';

type UserConnections = Map<string, Subject<SseEvent>>;

export default UserConnections;
