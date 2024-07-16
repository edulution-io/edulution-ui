import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Guacamole from 'guacamole-common-js';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md';
import cn from '@/lib/utils';
import { WEBSOCKET_URL } from '@libs/desktopdeployment/constants';
import useIsMobileView from '@/hooks/useIsMobileView';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useDesktopDeploymentStore from './DesktopDeploymentStore';

const VDIFrame = () => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Guacamole.Client | null>(null);
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const {
    error,
    guacToken,
    dataSource,
    isVdiConnectionMinimized,
    guacId,
    openVdiConnection,
    setIsVdiConnectionMinimized,
    setOpenVdiConnection,
  } = useDesktopDeploymentStore();
  const [clientState, setClientState] = useState(0);

  const handleDisconnect = () => {
    if (guacRef.current) {
      guacRef.current.disconnect();
    }
    setOpenVdiConnection(false);
  };

  useEffect(() => {
    if (guacToken === '' || !displayRef.current) return () => {};

    const tunnel = new Guacamole.WebSocketTunnel(WEBSOCKET_URL);
    const guac = new Guacamole.Client(tunnel);
    guacRef.current = guac;
    const displayElement = displayRef.current;

    const guacamoleConfig = {
      token: guacToken,
      GUAC_ID: guacId,
      GUAC_TYPE: 'c',
      GUAC_DATA_SOURCE: dataSource,
      GUAC_WIDTH: window.innerWidth - 56,
      GUAC_HEIGHT: window.innerHeight,
      GUAC_DPI: 96,
      GUAC_TIMEZONE: 'Europe/Berlin',
      GUAC_AUDIO: ['audio/L8', 'audio/L16'],
      GUAC_IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
    };

    const params = new URLSearchParams();

    Object.entries(guacamoleConfig).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, val));
      } else {
        params.append(key, value as string);
      }
    });
    guac.connect(params);

    const mouse: Guacamole.Mouse = new Guacamole.Mouse(guac.getDisplay().getElement());
    // @ts-expect-error due to readability
    mouse.onmousedown = guac.sendMouseState.bind(guac);
    // @ts-expect-error due to readability
    mouse.onmouseup = guac.sendMouseState.bind(guac);
    // @ts-expect-error due to readability
    mouse.onmousemove = guac.sendMouseState.bind(guac);

    const touchscreen = new Guacamole.Mouse.Touchscreen(guac.getDisplay().getElement());
    // @ts-expect-error due to readability
    touchscreen.onmousedown = guac.sendMouseState.bind(guac);
    // @ts-expect-error due to readability
    touchscreen.onmouseup = guac.sendMouseState.bind(guac);
    // @ts-expect-error due to readability
    touchscreen.onmousemove = guac.sendMouseState.bind(guac);

    const touch = new Guacamole.Touch(guac.getDisplay().getElement());
    // @ts-expect-error due to readability
    touch.ontouchstart = guac.sendTouchState.bind(guac);
    // @ts-expect-error due to readability
    touch.ontouchend = guac.sendTouchState.bind(guac);
    // @ts-expect-error due to readability
    touch.ontouchmove = guac.sendTouchState.bind(guac);

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
      console.info(stateMap[state]);
      setClientState(state);

      if (state === 5) {
        handleDisconnect();
      }
    };

    return () => {
      handleDisconnect();
    };
  }, [guacToken, openVdiConnection]);

  useEffect(() => {
    const handleResize = () => {
      if (guacRef.current) {
        guacRef.current.sendSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [guacRef.current, isVdiConnectionMinimized]);

  const style = isVdiConnectionMinimized ? { width: 0 } : { width: isMobileView ? '100%' : 'calc(100% - 56px)' };

  return createPortal(
    !error ? (
      <>
        {clientState < 3 && <LoadingIndicator isOpen />}
        <div
          className={cn(
            'fixed -top-1 left-1/2 z-[99] -translate-x-1/2 transform',
            isMobileView && 'flex items-center space-x-4',
          )}
        >
          <button
            type="button"
            className="mr-1 rounded bg-ciLightBlue px-4 hover:bg-ciDarkBlue"
            onClick={() => setIsVdiConnectionMinimized(!isVdiConnectionMinimized)}
          >
            {isVdiConnectionMinimized ? <MdMaximize className="inline" /> : <MdMinimize className="inline" />}{' '}
            {isMobileView ? '' : t(isVdiConnectionMinimized ? 'conferences.maximize' : 'conferences.minimize')}
          </button>
          <button
            type="button"
            className="rounded bg-ciRed px-4 hover:bg-ciRed/90"
            onClick={handleDisconnect}
          >
            <MdClose className="inline" /> {isMobileView ? '' : t('desktopdeployment.close')}
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
