import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Guacamole from 'guacamole-common-js';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md';
import { useMediaQuery } from 'usehooks-ts';
import cn from '@/lib/utils';
import useDesktopDeploymentStore from './DesktopDeploymentStore';

const VDIFrame = () => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Guacamole.Client | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation();
  const { error, token, dataSource, isVdiConnectionMinimized, setIsVdiConnectionMinimized, setToken } =
    useDesktopDeploymentStore();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [connectionState, setConnectionState] = useState<string>('');

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isVdiConnectionMinimized]);

  const handleDisconnect = () => {
    if (guacRef.current) {
      console.info('disconnect guac client');

      guacRef.current.disconnect();
    }
    if (displayRef.current) {
      console.info('set inner html to empty string');
      displayRef.current.innerHTML = '';
    }
    setToken('');
  };

  useEffect(() => {
    if (token === '' || !displayRef.current) return;
    const url = new URL(window.location.origin);
    const webSocketFullUrl = `wss://${url.host}/guacamole/websocket-tunnel`;
    const tunnel = new Guacamole.WebSocketTunnel(webSocketFullUrl);
    const guac = new Guacamole.Client(tunnel);
    guacRef.current = guac;
    const displayElement = displayRef.current;

    const paramsObject = {
      token,
      GUAC_ID: 1,
      GUAC_TYPE: 'c',
      GUAC_DATA_SOURCE: dataSource,
      GUAC_WIDTH: screenWidth - 56,
      GUAC_HEIGHT: screenHeight,
      GUAC_TIMEZONE: 'Europe/Berlin',
      GUAC_AUDIO: ['audio/L8', 'audio/L16'],
      GUAC_IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
    };

    const params = new URLSearchParams();

    Object.entries(paramsObject).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, val));
      } else {
        params.append(key, value as string);
      }
    });
    guac.connect(params);

    guac.sendSize(screenWidth, screenHeight);

    const mouse = new Guacamole.Mouse(guac.getDisplay().getElement());
    // @ts-expect-error due to readability
    mouse.onmousedown = guac.sendMouseState.bind(guac);
    // @ts-expect-error due to readability
    mouse.onmouseup = guac.sendMouseState.bind(guac);
    // @ts-expect-error due to readability
    mouse.onmousemove = guac.sendMouseState.bind(guac);

    const keyboard = new Guacamole.Keyboard(document);
    keyboard.onkeydown = (keysym) => guac.sendKeyEvent(1, keysym);
    keyboard.onkeyup = (keysym) => guac.sendKeyEvent(0, keysym);

    displayElement.appendChild(guac.getDisplay().getElement());

    const canvasElements = Array.from(displayElement.getElementsByTagName('canvas'));
    canvasElements.forEach((canvas) => {
      const newCanvas = canvas;
      newCanvas.style.position = 'absolute';
      newCanvas.style.zIndex = '1';
    });

    guac.onstatechange = (state) => {
      const stateMap = {
        0: 'IDLE',
        1: 'CONNECTING',
        2: 'WAITING',
        3: 'CONNECTED',
        4: 'DISCONNECTING',
        5: 'DISCONNECTED',
      };
      setConnectionState(stateMap[state] || 'UNKNOWN');
      if (state === 3) {
        // CONNECTED
        console.info('Guacamole client connected');
      }
      if (state === 5) {
        // DISCONNECTED
        handleDisconnect();
        console.info(connectionState, 'Guacamole client disconnected');
      }
    };

    // eslint-disable-next-line consistent-return
    return () => {
      guac.disconnect();
      displayElement.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const displayElement = displayRef.current;
    if (isVdiConnectionMinimized && displayElement) {
      const canvasElements = Array.from(displayElement.getElementsByTagName('canvas'));
      canvasElements.forEach((canvas) => {
        const newCanvas = canvas;
        newCanvas.style.width = '0';
      });
    } else if (!isVdiConnectionMinimized && displayElement) {
      const canvasElements = Array.from(displayElement.getElementsByTagName('canvas'));
      canvasElements.forEach((canvas) => {
        const newCanvas = canvas;
        newCanvas.style.width = `${screenWidth}px`;
      });
    }
  }, [displayRef, isVdiConnectionMinimized]);

  const style = isVdiConnectionMinimized ? { width: 0 } : { width: isMobile ? '100%' : 'calc(100% - 56px)' };

  return createPortal(
    !error ? (
      <>
        <div
          className={cn(
            'fixed -top-1 left-1/2 z-[99] -translate-x-1/2 transform',
            isMobile && 'flex items-center space-x-4',
          )}
        >
          <button
            type="button"
            className="mr-1 rounded bg-ciLightBlue px-4 text-white hover:bg-ciDarkBlue"
            onClick={() => setIsVdiConnectionMinimized(!isVdiConnectionMinimized)}
          >
            {isVdiConnectionMinimized ? <MdMaximize className="inline" /> : <MdMinimize className="inline" />}{' '}
            {isMobile ? '' : t(isVdiConnectionMinimized ? 'conferences.maximize' : 'conferences.minimize')}
          </button>
          <button
            type="button"
            className="rounded bg-ciRed px-4 text-white hover:bg-ciRed/90"
            onClick={handleDisconnect}
          >
            <MdClose className="inline" /> {isMobile ? '' : t('desktopdeployment.close')}
          </button>
        </div>
        <div
          id="display"
          ref={displayRef}
          className="z-1 absolute inset-y-0 left-0 w-screen overflow-hidden"
          style={style}
        />
      </>
    ) : null,

    document.body,
  );
};

export default VDIFrame;
