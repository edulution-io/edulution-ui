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

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@edulution-io/ui-kit';
import { useTranslation } from 'react-i18next';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import MarkdownRenderer from '@/components/ui/Renderer/MarkdownRenderer';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';
import useSubMenuStore from '@/store/useSubMenuStore';
import WikiEditorHeader from '@/pages/Wiki/components/WikiEditorHeader';

const WikiEditor: React.FC = () => {
  const { t } = useTranslation();
  const {
    editorContent,
    setEditorContent,
    selectedRegistrationId,
    selectedPagePath,
    pages,
    isEditing,
    selectPage,
    fetchPageContent,
  } = useWikiStore();
  const { setActiveSection } = useSubMenuStore();

  if (!selectedRegistrationId) return null;

  const isIndexPage = selectedPagePath === WIKI_CONSTANTS.INDEX_PAGE_NAME;

  const handlePageClick = (relativePath: string) => {
    selectPage(relativePath);
    setActiveSection(relativePath);
    if (selectedRegistrationId) {
      void fetchPageContent(selectedRegistrationId, relativePath);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <WikiEditorHeader />
      <div className="flex-1 overflow-y-auto p-4">
        <MarkdownRenderer
          content={editorContent}
          editable={isEditing}
          showToolbar={isEditing}
          showPreview={isEditing}
          transparentBackground
          onChange={setEditorContent}
        />
        {isIndexPage && !isEditing && pages.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <h2 className="mb-3 text-lg font-bold">{t('wiki.pages')}</h2>
            <ul className="space-y-1">
              {pages.map((page) => (
                <li key={page.relativePath}>
                  <Button
                    type="button"
                    variant="btn-ghost"
                    onClick={() => handlePageClick(page.relativePath)}
                    className="flex w-full items-center justify-start gap-2 py-2 font-normal hover:bg-muted-background"
                  >
                    <FontAwesomeIcon
                      icon={faFile}
                      className="h-3.5 w-3.5 text-muted-foreground"
                    />
                    <span>{page.title}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WikiEditor;
