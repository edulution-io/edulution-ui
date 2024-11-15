import React, { useEffect, useRef, useState } from 'react';
import Guacamole from 'guacamole-common-js';
import { WEBSOCKET_URL } from '@libs/desktopdeployment/constants';
import { SIDEBAR_WIDTH } from '@libs/ui/constants';
import ResizableWindow from '@/components/framing/ResizableWindow';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useDesktopDeploymentStore from './DesktopDeploymentStore';

const VDIFrame = () => {
  const { t } = useTranslation();
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Guacamole.Client | null>(null);
  const { error, guacToken, dataSource, guacId, isVdiConnectionOpen, setIsVdiConnectionOpen } =
    useDesktopDeploymentStore();
  const [clientState, setClientState] = useState(0);

  const handleDisconnect = () => {
    if (guacRef.current) {
      guacRef.current.disconnect();
    }
    setIsVdiConnectionOpen(false);
  };

  useEffect(() => {
    if (guacToken === '' || !displayRef.current || !isVdiConnectionOpen) return () => {};

    const tunnel = new Guacamole.WebSocketTunnel(WEBSOCKET_URL);
    const guac = new Guacamole.Client(tunnel);
    guacRef.current = guac;
    const displayElement = displayRef.current;

    const guacamoleConfig = {
      token: guacToken,
      GUAC_ID: guacId,
      GUAC_TYPE: 'c',
      GUAC_DATA_SOURCE: dataSource,
      GUAC_WIDTH: window.innerWidth - SIDEBAR_WIDTH,
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

    const guacSendMouseState = guac.sendMouseState.bind(guac);

    const mouse = new Guacamole.Mouse(displayElement);
    mouse.onmousedown = guacSendMouseState;
    mouse.onmouseup = guacSendMouseState;
    mouse.onmousemove = guacSendMouseState;

    const touchscreen = new Guacamole.Mouse.Touchscreen(displayElement);
    touchscreen.onmousedown = guacSendMouseState;
    touchscreen.onmouseup = guacSendMouseState;
    touchscreen.onmousemove = guacSendMouseState;

    const touch = new Guacamole.Touch(displayElement);
    touch.ontouchstart = guac.sendTouchState.bind(guac);
    touch.ontouchend = guac.sendTouchState.bind(guac);
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
      console.info(`Guacamole changed the state to ${stateMap[state]}`);
      setClientState(state);

      if (state === 5) {
        handleDisconnect();
      }
    };

    return () => {
      handleDisconnect();
    };
  }, [guacToken, isVdiConnectionOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (guacRef.current) {
        guacRef.current.sendSize(window.innerWidth - SIDEBAR_WIDTH, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [guacRef.current]);

  if (!isVdiConnectionOpen || error) {
    return null;
  }

  return (
    <ResizableWindow
      titleTranslationId={t('desktopdeployment.topic')}
      handleClose={handleDisconnect}
    >
      <div
        id="display"
        ref={displayRef}
        className="h-full w-full border-none"
      />
      {clientState < 3 && <LoadingIndicator isOpen />}
    </ResizableWindow>
  );
};

export default VDIFrame;
