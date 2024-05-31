import React from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

const Whiteboard = () => {
  return (
    <div className="absolute inset-y-0 left-0 ml-0 mr-14 w-screen justify-center pr-14">
      <div className="h-full w-full flex-grow">
        <Excalidraw theme={'dark'} />
      </div>
    </div>
  );
};

export default Whiteboard;
