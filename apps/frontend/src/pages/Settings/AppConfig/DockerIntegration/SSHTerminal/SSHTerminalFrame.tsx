/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Client, WebSocketTunnel, Mouse, Keyboard, Status } from '@glokon/guacamole-common-js';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import GUACAMOLE_WEBSOCKET_URL from '@libs/desktopdeployment/constants/guacamole-websocket-url';
import getBrowserTimezone from '@libs/common/utils/Date/getBrowserTimezone';
import { guacamoleClientStateMap, getGuacamoleErrorMessage } from '@/pages/DesktopDeployment/utils';
import useSSHTerminalStore from './useSSHTerminalStore';

const SSH_TERMINAL_FRAME_ID = 'ssh-terminal.topic';

const SSHTerminalFrame: React.FC = () => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Client | null>(null);
  const { guacToken, dataSource, connectionId, isTerminalOpen, setIsTerminalOpen, reset } = useSSHTerminalStore();
  const [clientState, setClientState] = useState<Client.State>(Client.State.IDLE);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  const { minimizedWindowedFrames } = useFrameStore();

  const isMinimized = minimizedWindowedFrames.includes(SSH_TERMINAL_FRAME_ID);

  const handleDisconnect = useCallback(() => {
    try {
      if (guacRef.current) {
        guacRef.current.disconnect();
      }
    } catch (e) {
      console.error('Guacamole SSH disconnect error:', e);
    } finally {
      guacRef.current = null;
      setIsTerminalOpen(false);
      setClientState(Client.State.IDLE);
      setContainerSize(null);
    }
  }, [setIsTerminalOpen]);

  const handleClose = useCallback(() => {
    handleDisconnect();
    reset();
  }, [handleDisconnect, reset]);

  useEffect(() => {
    if (!displayRef.current || !isTerminalOpen) return undefined;

    const updateSize = () => {
      const el = displayRef.current;
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        setContainerSize({ width: el.clientWidth, height: el.clientHeight });
      }
    };

    updateSize();

    const timeouts = [setTimeout(updateSize, 50), setTimeout(updateSize, 100), setTimeout(updateSize, 200)];

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(displayRef.current);

    return () => {
      timeouts.forEach(clearTimeout);
      resizeObserver.disconnect();
    };
  }, [isTerminalOpen]);

  useEffect(() => {
    if (displayRef.current && isTerminalOpen && !isMinimized) {
      const guacDisplayElement = displayRef.current.querySelector('div');
      if (guacDisplayElement) {
        (guacDisplayElement as HTMLElement).focus();
      }
    }
  }, [isTerminalOpen, isMinimized]);

  useEffect(() => {
    if (guacToken === '' || !displayRef.current || !isTerminalOpen || !containerSize) return undefined;

    if (guacRef.current) {
      return undefined;
    }

    const displayElement = displayRef.current;
    let isCleanedUp = false;

    const tunnel = new WebSocketTunnel(GUACAMOLE_WEBSOCKET_URL);
    const guac = new Client(tunnel);
    guacRef.current = guac;

    tunnel.onerror = (status: Status) => {
      if (isCleanedUp) return;
      const errorMessage = getGuacamoleErrorMessage(status);
      console.error('SSH WebSocket tunnel error:', status.code, errorMessage);
    };

    guac.onstatechange = (state: Client.State) => {
      if (isCleanedUp) return;
      console.info(`Guacamole SSH changed the state to ${guacamoleClientStateMap[state]}`);
      setClientState(state);

      if (state === Client.State.DISCONNECTED) {
        handleDisconnect();
      }
    };

    guac.onerror = (status: Status) => {
      if (isCleanedUp) return;
      const errorMessage = getGuacamoleErrorMessage(status);
      console.error('Guacamole SSH error:', status.code, errorMessage);
    };

    const guacDisplay = guac.getDisplay();
    const guacDisplayElement = guacDisplay.getElement();

    guacDisplayElement.style.position = 'absolute';
    guacDisplayElement.style.left = '0';
    guacDisplayElement.style.top = '0';
    guacDisplayElement.style.overflow = 'visible';

    const styleDisplayLayers = () => {
      const layers = guacDisplayElement.querySelectorAll('div');
      layers.forEach((layer, index) => {
        const layerEl = layer;
        if (layerEl.style.position === 'absolute') {
          layerEl.style.zIndex = String(index);
        }
      });
      const canvases = guacDisplayElement.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        const canvasEl = canvas;
        canvasEl.style.opacity = '1';
        canvasEl.style.visibility = 'visible';
      });
    };

    styleDisplayLayers();
    const mutationObserver = new MutationObserver(styleDisplayLayers);
    mutationObserver.observe(guacDisplayElement, { childList: true, subtree: true });

    displayElement.appendChild(guacDisplayElement);

    const mouse = new Mouse(guacDisplayElement);
    const sendMouseState = guac.sendMouseState.bind(guac);
    mouse.onmousedown = sendMouseState;
    mouse.onmouseup = sendMouseState;
    mouse.onmousemove = sendMouseState;

    const keyboard = new Keyboard(guacDisplayElement);
    keyboard.onkeydown = (keysym: number) => {
      guac.sendKeyEvent(1, keysym);
      return false;
    };
    keyboard.onkeyup = (keysym: number) => {
      guac.sendKeyEvent(0, keysym);
      return false;
    };

    guacDisplayElement.tabIndex = 0;
    guacDisplayElement.addEventListener('click', () => guacDisplayElement.focus());
    guacDisplayElement.focus();

    const params = new URLSearchParams();
    params.set('token', guacToken);
    params.set('GUAC_ID', connectionId);
    params.set('GUAC_TYPE', 'c');
    params.set('GUAC_DATA_SOURCE', dataSource);
    params.set('GUAC_WIDTH', String(containerSize.width));
    params.set('GUAC_HEIGHT', String(containerSize.height));
    params.set('GUAC_DPI', '96');
    params.set('GUAC_TIMEZONE', getBrowserTimezone());

    console.info('Connecting to Guacamole SSH with params:', params.toString());

    try {
      guac.connect(params.toString());
    } catch (e) {
      console.error('Guacamole SSH connect error', e);
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (!displayElement || !guac) return;
      const width = displayElement.clientWidth;
      const height = displayElement.clientHeight;
      if (width > 0 && height > 0) {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          guac.sendSize(width, height);
        }, 150);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(displayElement);

    return () => {
      isCleanedUp = true;
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      mouse.onmousedown = undefined;
      mouse.onmouseup = undefined;
      mouse.onmousemove = undefined;
      keyboard.onkeydown = null;
      keyboard.onkeyup = null;
      guac.disconnect();
      guacRef.current = null;
      if (guacDisplayElement.parentNode) {
        guacDisplayElement.parentNode.removeChild(guacDisplayElement);
      }
    };
  }, [guacToken, connectionId, dataSource, isTerminalOpen, containerSize, handleDisconnect]);

  if (!isTerminalOpen) {
    return null;
  }

  return (
    <ResizableWindow
      titleTranslationId={SSH_TERMINAL_FRAME_ID}
      handleClose={handleClose}
      openMaximized={false}
    >
      <div
        id="ssh-display"
        ref={displayRef}
        className="relative h-full w-full overflow-hidden bg-black outline-none"
        style={{ cursor: 'default' }}
      />
      {clientState < Client.State.CONNECTED && <LoadingIndicatorDialog isOpen />}
    </ResizableWindow>
  );
};

export default SSHTerminalFrame;
