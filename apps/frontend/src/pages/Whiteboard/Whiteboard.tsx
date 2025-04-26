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

import React, { lazy, Suspense } from 'react';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PageLayout from '@/components/structure/layout/PageLayout';
import useLanguage from '@/hooks/useLanguage';
import COLOR_SCHEME from '@libs/ui/constants/colorScheme';
import { Editor } from 'tldraw';

const TLDraw = lazy(() =>
  Promise.all([import('tldraw'), import('tldraw/tldraw.css')]).then(([module]) => ({
    default: module.Tldraw,
  })),
);

const Whiteboard = () => {
  const { language } = useLanguage();

  const handleMount = (editor: Editor) => {
    editor.user.updateUserPreferences({ colorScheme: COLOR_SCHEME, locale: language });
  };

  return (
    <PageLayout isFullScreen>
      <Suspense fallback={<CircleLoader className="m-auto" />}>
        <TLDraw onMount={handleMount} />
      </Suspense>
    </PageLayout>
  );
};

export default Whiteboard;
