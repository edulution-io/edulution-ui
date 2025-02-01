import React from 'react';
import { Excalidraw, THEME } from '@excalidraw/excalidraw';
import cn from '@libs/common/utils/className';
import useFrameStore from '@/components/framing/FrameStore';
import APPS from '@libs/appconfig/constants/apps';
import useLanguage from '@/hooks/useLanguage';

const Whiteboard = () => {
  const { activeEmbeddedFrame } = useFrameStore();
  const { language: lang } = useLanguage();

  const getStyle = () => (activeEmbeddedFrame === APPS.WHITEBOARD ? 'block' : 'hidden');

  return (
    <div
      className={cn(
        'absolute inset-y-0 left-0 ml-0 w-screen justify-center md:w-[calc(100%-var(--sidebar-width))]',
        getStyle(),
      )}
    >
      <div className="h-full w-full flex-grow">
        <Excalidraw
          theme={THEME.DARK}
          langCode={`${lang}-${lang.toUpperCase()}`}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
