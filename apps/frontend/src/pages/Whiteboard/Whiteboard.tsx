import React from 'react';
import { Excalidraw, THEME } from '@excalidraw/excalidraw';
import cn from '@libs/common/utils/className';
import useFrameStore from '@/components/framing/FrameStore';
import APPS from '@libs/appconfig/constants/apps';

const Whiteboard = () => {
  const { activeEmbeddedFrame } = useFrameStore();

  const getStyle = () => (activeEmbeddedFrame === APPS.WHITEBOARD ? 'block' : 'hidden');

  return (
    <div className={cn('absolute inset-y-0 left-0 ml-0 mr-14 w-screen justify-center pr-14', getStyle())}>
      <div className="h-full w-full flex-grow">
        <Excalidraw theme={THEME.DARK} />
      </div>
    </div>
  );
};

export default Whiteboard;
