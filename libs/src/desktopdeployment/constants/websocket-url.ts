const websocketProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const url = new URL(window.location.origin);

const WEBSOCKET_URL = `${websocketProtocol}://${url.host}/guacamole/websocket-tunnel`;

export default WEBSOCKET_URL;
