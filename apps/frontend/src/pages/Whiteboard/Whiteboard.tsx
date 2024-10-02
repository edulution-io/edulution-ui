import React from 'react';
import { Excalidraw, THEME } from '@excalidraw/excalidraw';
import cn from '@/lib/utils';
import useFrameStore from '@/components/framing/FrameStore';
import { APPS } from '@libs/appconfig/types';

const Whiteboard = () => {
  const { activeFrame } = useFrameStore();

  const getStyle = () => (activeFrame === APPS.WHITEBOARD ? 'block' : 'hidden');

  return (
    <div className={cn('absolute inset-y-0 left-0 ml-0 mr-14 w-screen justify-center pr-14', getStyle())}>
      <div className="h-full w-full flex-grow">
        <Excalidraw theme={THEME.DARK} />
      </div>
    </div>
  );
};

export default Whiteboard;
