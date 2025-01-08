import React, { useEffect, useRef, useState } from 'react';
import Guacamole from 'guacamole-common-js';
import { WEBSOCKET_URL } from '@libs/desktopdeployment/constants';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useFrameStore from '@/components/framing/FrameStore';
import { MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';
import useDesktopDeploymentStore from './DesktopDeploymentStore';

const VDIFrame = () => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Guacamole.Client | null>(null);
  const { error, guacToken, dataSource, guacId, isVdiConnectionOpen, setIsVdiConnectionOpen } =
    useDesktopDeploymentStore();
  const [clientState, setClientState] = useState(0);
  const [hasCurrentFrameSizeLoaded, setHasCurrentFrameSizeLoaded] = useState(false);
  const { currentWindowedFrameSizes, minimizedWindowedFrames } = useFrameStore();

  const handleDisconnect = () => {
    if (guacRef.current) {
      guacRef.current.disconnect();
    }
    setIsVdiConnectionOpen(false);
    setClientState(0);
    setHasCurrentFrameSizeLoaded(false);
  };

  const id = 'desktopdeployment.topic';
  const width = currentWindowedFrameSizes[id]?.width;
  const height = (currentWindowedFrameSizes[id]?.height || MAXIMIZED_BAR_HEIGHT) - MAXIMIZED_BAR_HEIGHT;
  const isMinimized = minimizedWindowedFrames.includes(id);

  useEffect(() => {
    if (!hasCurrentFrameSizeLoaded) {
      setHasCurrentFrameSizeLoaded(!!width && !!height);
    }
  }, [currentWindowedFrameSizes[id]]);

  useEffect(() => {
    if (displayRef.current) {
      if (isVdiConnectionOpen && !isMinimized) {
        displayRef.current.focus();
      }
    }
  }, [displayRef.current, isVdiConnectionOpen, isMinimized]);

  useEffect(() => {
    if (guacToken === '' || !displayRef.current || !isVdiConnectionOpen || !hasCurrentFrameSizeLoaded) return () => {};

    const tunnel = new Guacamole.WebSocketTunnel(WEBSOCKET_URL);
    const guac = new Guacamole.Client(tunnel);
    guacRef.current = guac;
    const displayElement = displayRef.current;
    displayElement.tabIndex = 0;

    const guacamoleConfig = {
      token: guacToken,
      GUAC_ID: guacId,
      GUAC_TYPE: 'c',
      GUAC_DATA_SOURCE: dataSource,
      GUAC_WIDTH: width,
      GUAC_HEIGHT: height,
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

    const keyboard = new Guacamole.Keyboard(displayElement);
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
  }, [guacToken, isVdiConnectionOpen, hasCurrentFrameSizeLoaded]);

  useEffect(() => {
    if (guacRef.current && !isMinimized && displayRef.current) {
      guacRef.current.sendSize(width, height);
      displayRef.current.focus();
    }
  }, [guacRef.current, width, height, isMinimized]);

  if (!isVdiConnectionOpen || error) {
    return null;
  }

  return (
    <ResizableWindow
      titleTranslationId={id}
      handleClose={handleDisconnect}
      disableToggleMaximizeWindow
    >
      <div
        id="display"
        ref={displayRef}
        className="h-full w-full border-none bg-black"
      />
      {clientState < 3 && <LoadingIndicator isOpen />}
    </ResizableWindow>
  );
};

export default VDIFrame;
