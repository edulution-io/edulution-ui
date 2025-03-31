/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { Excalidraw, THEME } from '@excalidraw/excalidraw';
import cn from '@libs/common/utils/className';
import useFrameStore from '@/components/framing/FrameStore';
import APPS from '@libs/appconfig/constants/apps';
import useLanguage from '@/hooks/useLanguage';
import PageTitle from '@/components/PageTitle';

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
      <PageTitle translationId="whiteboard.sidebar" />
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
