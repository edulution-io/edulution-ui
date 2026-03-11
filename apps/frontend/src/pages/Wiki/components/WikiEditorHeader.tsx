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

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';
import { Input } from '@edulution-io/ui-kit';

const WikiEditorHeader: React.FC = () => {
  const { t } = useTranslation();
  const { editorTitle, setEditorTitle, editorContent, setEditorContent, selectedPagePath, isEditing } = useWikiStore();

  const isIndexPage = selectedPagePath === WIKI_CONSTANTS.INDEX_PAGE_NAME;
  const showTitleInput = isEditing;

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setEditorTitle(newTitle);
      if (isIndexPage) {
        const headingRegex = /^#\s+.+$/m;
        if (headingRegex.test(editorContent)) {
          setEditorContent(editorContent.replace(headingRegex, `# ${newTitle}`));
        } else {
          setEditorContent(`# ${newTitle}\n${editorContent}`);
        }
      }
    },
    [isIndexPage, editorContent, setEditorTitle, setEditorContent],
  );

  return (
    <div className="border-b border-border px-4 py-3">
      {showTitleInput ? (
        <Input
          value={editorTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e.target.value)}
          placeholder={t('wiki.titlePlaceholder')}
          className="border-none bg-transparent text-xl font-bold outline-none placeholder:text-muted-foreground"
        />
      ) : (
        <h1 className="text-xl font-bold">{editorTitle || t('wiki.titlePlaceholder')}</h1>
      )}
    </div>
  );
};

export default WikiEditorHeader;
