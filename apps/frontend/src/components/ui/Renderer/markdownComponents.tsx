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

import React, { ComponentType, ReactNode } from 'react';
import MARKDOWN_STYLES from '@libs/common/constants/markdownStyles';

type MarkdownComponentProps = {
  children?: ReactNode;
  className?: string;
  href?: string;
  [key: string]: unknown;
};

type MarkdownComponents = Record<string, ComponentType<MarkdownComponentProps>>;

const markdownComponents: MarkdownComponents = {
  h1: ({ children }) => <h1 className={MARKDOWN_STYLES.h1.tailwind}>{children}</h1>,
  h2: ({ children }) => <h2 className={MARKDOWN_STYLES.h2.tailwind}>{children}</h2>,
  h3: ({ children }) => <h3 className={MARKDOWN_STYLES.h3.tailwind}>{children}</h3>,
  p: ({ children }) => <p className={MARKDOWN_STYLES.p.tailwind}>{children}</p>,
  ul: ({ children }) => <ul className={MARKDOWN_STYLES.ul.tailwind}>{children}</ul>,
  ol: ({ children }) => <ol className={MARKDOWN_STYLES.ol.tailwind}>{children}</ol>,
  li: ({ children }) => <li className={MARKDOWN_STYLES.li.tailwind}>{children}</li>,
  code: ({ className: codeClassName, children, ...props }) => {
    const isInline = !codeClassName;
    if (isInline) {
      return (
        <code
          className={MARKDOWN_STYLES.codeInline.tailwind}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={`${codeClassName} ${MARKDOWN_STYLES.codeBlock.tailwind}`}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className={MARKDOWN_STYLES.pre.tailwind}>{children}</pre>,
  table: ({ children }) => (
    <div className={MARKDOWN_STYLES.tableWrapper.tailwind}>
      <table className={MARKDOWN_STYLES.table.tailwind}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className={MARKDOWN_STYLES.thead.tailwind}>{children}</thead>,
  tr: ({ children }) => <tr className={MARKDOWN_STYLES.tr.tailwind}>{children}</tr>,
  th: ({ children }) => <th className={MARKDOWN_STYLES.th.tailwind}>{children}</th>,
  td: ({ children }) => <td className={MARKDOWN_STYLES.td.tailwind}>{children}</td>,
  a: ({ href, children }) => (
    <a
      href={href}
      className={MARKDOWN_STYLES.a.tailwind}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className={MARKDOWN_STYLES.blockquote.tailwind}>{children}</blockquote>,
  hr: () => <hr className={MARKDOWN_STYLES.hr.tailwind} />,
  strong: ({ children }) => <strong className={MARKDOWN_STYLES.strong.tailwind}>{children}</strong>,
  em: ({ children }) => <em className={MARKDOWN_STYLES.em.tailwind}>{children}</em>,
};

export default markdownComponents;
