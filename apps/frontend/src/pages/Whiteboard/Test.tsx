import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import TLDRAW_WEBSOCKET_URL from '@libs/tldraw-sync/constants/tldrawWebsocketUrl';
import useUserStore from '@/store/UserStore/UserStore';

const SocketTest = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { eduApiToken } = useUserStore();

  useEffect(() => {
    const uri = `${TLDRAW_WEBSOCKET_URL}/${1}?token=${eduApiToken}`;
    console.log(`uri ${JSON.stringify(uri, null, 2)}`);
    const socket = io(uri, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Verbunden mit Socket.io Server, Socket-ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Verbindung getrennt:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Verbindungsfehler:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Socket.IO Test</h2>
      <p>Status: {isConnected ? 'Verbunden' : 'Nicht verbunden'}</p>
    </div>
  );
};

export default SocketTest;
