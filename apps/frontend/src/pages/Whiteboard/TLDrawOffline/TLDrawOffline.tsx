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

import React, { lazy } from 'react';
import COLOR_SCHEME from '@libs/ui/constants/colorScheme';
import { Editor } from 'tldraw';
import useLanguage from '@/hooks/useLanguage';
import TLDRAW_PERSISTENCE_KEY from '@libs/whiteboard/constants/tldrawPersistenceKey';
import tlDrawComponents from '@/pages/Whiteboard/components/tlDrawComponents';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';

const TLDraw = lazy(() =>
  Promise.all([import('tldraw'), import('tldraw/tldraw.css')]).then(([module]) => ({
    default: module.Tldraw,
  })),
);

const TlDrawOffline = () => {
  const { language } = useLanguage();
  const { setEditor } = useWhiteboardEditorStore();
  const handleMount = (editor: Editor) => {
    editor.user.updateUserPreferences({ colorScheme: COLOR_SCHEME, locale: language });
    setEditor(editor);
  };

  return (
    <TLDraw
      onMount={handleMount}
      persistenceKey={TLDRAW_PERSISTENCE_KEY}
      components={tlDrawComponents}
    />
  );
};

export default TlDrawOffline;
