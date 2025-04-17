import WEBSOCKET_URL from '@libs/common/constants/websocket-url';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

const TLDRAW_WEBSOCKET_URL = `${WEBSOCKET_URL}/${EDU_API_ROOT}/${TLDRAW_SYNC_ENDPOINTS.BASE}/${TLDRAW_SYNC_ENDPOINTS.ROOMS}`;

export default TLDRAW_WEBSOCKET_URL;
