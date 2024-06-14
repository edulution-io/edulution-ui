import React from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import useFrameStore from '@/routes/IframeStore';
import { APPS } from '@/datatypes/types';
import cn from '@/lib/utils';

const Whiteboard = () => {
  const { activeFrame } = useFrameStore();

  const getStyle = () => (activeFrame === APPS.WHITEBOARD ? 'block' : 'hidden');

  return (
    <div className={cn('absolute inset-y-0 left-0 ml-0 mr-14 w-screen justify-center pr-14', getStyle())}>
      <div className="h-full w-full flex-grow">
        <Excalidraw theme="dark" />
      </div>
    </div>
  );
};

export default Whiteboard;
