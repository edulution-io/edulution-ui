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

import React, { useMemo } from 'react';
import MDEditor, { PreviewType } from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import useThemeStore from '@/store/useThemeStore';
import markdownComponents from '@/components/ui/Renderer/markdownComponents';
import '@/components/ui/Renderer/MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  editable?: boolean;
  showToolbar?: boolean;
  showPreview?: boolean;
  onChange?: (value: string) => void;
}

const MarkdownRenderer = ({
  content,
  className,
  editable = false,
  showToolbar = true,
  showPreview = true,
  onChange,
}: MarkdownRendererProps) => {
  const theme = useThemeStore((state) => state.theme);

  const previewOptions = useMemo(
    () => ({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
      components: markdownComponents,
    }),
    [],
  );

  const handleChange = (value: string | undefined) => {
    onChange?.(value ?? '');
  };

  const previewMode: PreviewType = showPreview ? 'live' : 'edit';

  if (!editable) {
    return (
      <div
        className={className}
        data-color-mode={theme}
      >
        <MDEditor.Markdown
          source={content}
          remarkPlugins={previewOptions.remarkPlugins}
          rehypePlugins={previewOptions.rehypePlugins}
          components={previewOptions.components}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      data-color-mode={theme}
    >
      <MDEditor
        value={content}
        onChange={handleChange}
        preview={previewMode}
        height="100%"
        visibleDragbar={false}
        hideToolbar={!showToolbar}
        previewOptions={previewOptions}
      />
    </div>
  );
};

export default MarkdownRenderer;
