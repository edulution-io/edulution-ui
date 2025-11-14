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

import { Editor, StoreSnapshot, TLRecord } from 'tldraw';
import isTldrFileV1 from '@libs/tldraw-sync/utils/isTldrFileV1';
import toStoreSnapshot from '@libs/tldraw-sync/utils/toStoreSnapshot';
import firstPageIdFrom from '@libs/tldraw-sync/utils/firstPageIdFrom';
import { hasSetCurrentPage, hasSetCurrentPageId } from '@libs/tldraw-sync/utils/editorGuards';
import nextAnimationFrame from '@libs/tldraw-sync/utils/nextAnimationFrame';

const loadTldrFileIntoEditor = async (editor: Editor, file: File): Promise<void> => {
  const text = (await file.text()).trimStart();
  if (!(text.startsWith('{') || text.startsWith('['))) {
    throw new Error('whiteboard.openTLFileFailed');
  }

  const parsed = JSON.parse(text) as unknown;

  const snapshot: StoreSnapshot<TLRecord> = isTldrFileV1(parsed)
    ? toStoreSnapshot(parsed)
    : (parsed as StoreSnapshot<TLRecord>);

  try {
    editor.loadSnapshot(snapshot);
  } catch {
    const currentSchema = editor.getSnapshot().document.schema;
    const adjusted: StoreSnapshot<TLRecord> = { schema: currentSchema, store: snapshot.store };
    editor.loadSnapshot(adjusted);
  }

  const firstPageId = firstPageIdFrom(snapshot);
  if (firstPageId) {
    const current = editor.getCurrentPageId();
    if (current !== firstPageId) {
      if (hasSetCurrentPageId(editor)) editor.setCurrentPageId(firstPageId);
      else if (hasSetCurrentPage(editor)) editor.setCurrentPage(firstPageId);
    }
  }

  await nextAnimationFrame();
  editor.zoomToFit();
  editor.selectNone();
};

export default loadTldrFileIntoEditor;
