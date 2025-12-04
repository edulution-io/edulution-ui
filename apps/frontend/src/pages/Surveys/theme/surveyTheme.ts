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

import { IHeader, ImageFit, ITheme } from 'survey-core';
import COLOR_SCHEME from '@libs/ui/constants/colorScheme';

const surveyTheme: ITheme = {
  backgroundImage: '',
  backgroundImageAttachment: 'fixed',
  backgroundImageFit: 'auto' as ImageFit,
  backgroundOpacity: 0,
  colorPalette: COLOR_SCHEME,
  cssVariables: {
    '--sjs-corner-radius': '3px',
    '--sjs-base-unit': '8px',
    '--sjs-shadow-small': '0px 1px 2px 0px rgba(0, 0, 0, 0.35)',
    '--sjs-shadow-inner': 'inset 0px 1px 2px 0px rgba(0, 0, 0, 0.2)',
    '--sjs-border-default': 'var(--ring)',
    '--sjs-border-light': 'var(--ring)',
    '--sjs-general-backcolor': 'rgba(0, 0, 0, 0.4)',
    '--sjs-general-backcolor-dark': 'var(--accent)',
    '--sjs-general-backcolor-dim-light': 'var(--accent)',
    '--sjs-general-backcolor-dim-dark': 'var(--muted)',
    '--sjs-general-forecolor': 'var(--secondary)',
    '--sjs-general-forecolor-light': 'var(--secondary)',
    '--sjs-general-dim-forecolor': 'var(--muted)',
    '--sjs-general-dim-forecolor-light': 'var(--muted-light)',
    '--sjs-secondary-backcolor': 'var(--overlay)',
    '--sjs-secondary-backcolor-light': 'var(--muted-dialog)',
    '--sjs-secondary-backcolor-semi-light': 'var(--overlay-foreground)',
    '--sjs-secondary-forecolor': 'var(--secondary-foreground)',
    '--sjs-secondary-forecolor-light': 'var(--secondary-foreground)',
    '--sjs-shadow-small-reset': '0px 0px 0px 0px rgba(0, 0, 0, 0.35)',
    '--sjs-shadow-medium': '0px 2px 6px 0px rgba(0, 0, 0, 0.2)',
    '--sjs-shadow-large': '0px 8px 16px 0px rgba(0, 0, 0, 0.2)',
    '--sjs-shadow-inner-reset': 'inset 0px 0px 0px 0px rgba(0, 0, 0, 0.2)',
    '--sjs-border-inside': 'var(--ring)',
    '--sjs-special-red-forecolor': 'var(--destructive)',
    '--sjs-special-green': 'var(--ci-light-green)',
    '--sjs-special-green-light': 'var(--ci-light-green)',
    '--sjs-special-green-forecolor': 'var(--ci-light-green)',
    '--sjs-special-blue': 'var(--ci-dark-blue)',
    '--sjs-special-blue-light': 'var(--ci-dark-blue)',
    '--sjs-special-blue-forecolor': 'var(--ci-dark-blue)',
    '--sjs-special-yellow': 'var(--overlay)',
    '--sjs-special-yellow-light': 'var(--muted)',
    '--sjs-special-yellow-forecolor': 'var(--muted-light)',
    '--sjs-article-font-xx-large-textDecoration': 'none',
    '--sjs-article-font-xx-large-fontWeight': '700',
    '--sjs-article-font-xx-large-fontStyle': 'normal',
    '--sjs-article-font-xx-large-fontStretch': 'normal',
    '--sjs-article-font-xx-large-letterSpacing': '0',
    '--sjs-article-font-xx-large-lineHeight': '64px',
    '--sjs-article-font-xx-large-paragraphIndent': '0px',
    '--sjs-article-font-xx-large-textCase': 'none',
    '--sjs-article-font-x-large-textDecoration': 'none',
    '--sjs-article-font-x-large-fontWeight': '700',
    '--sjs-article-font-x-large-fontStyle': 'normal',
    '--sjs-article-font-x-large-fontStretch': 'normal',
    '--sjs-article-font-x-large-letterSpacing': '0',
    '--sjs-article-font-x-large-lineHeight': '56px',
    '--sjs-article-font-x-large-paragraphIndent': '0px',
    '--sjs-article-font-x-large-textCase': 'none',
    '--sjs-article-font-large-textDecoration': 'none',
    '--sjs-article-font-large-fontWeight': '700',
    '--sjs-article-font-large-fontStyle': 'normal',
    '--sjs-article-font-large-fontStretch': 'normal',
    '--sjs-article-font-large-letterSpacing': '0',
    '--sjs-article-font-large-lineHeight': '40px',
    '--sjs-article-font-large-paragraphIndent': '0px',
    '--sjs-article-font-large-textCase': 'none',
    '--sjs-article-font-medium-textDecoration': 'none',
    '--sjs-article-font-medium-fontWeight': '700',
    '--sjs-article-font-medium-fontStyle': 'normal',
    '--sjs-article-font-medium-fontStretch': 'normal',
    '--sjs-article-font-medium-letterSpacing': '0',
    '--sjs-article-font-medium-lineHeight': '32px',
    '--sjs-article-font-medium-paragraphIndent': '0px',
    '--sjs-article-font-medium-textCase': 'none',
    '--sjs-article-font-default-textDecoration': 'none',
    '--sjs-article-font-default-fontWeight': '400',
    '--sjs-article-font-default-fontStyle': 'normal',
    '--sjs-article-font-default-fontStretch': 'normal',
    '--sjs-article-font-default-letterSpacing': '0',
    '--sjs-article-font-default-lineHeight': '28px',
    '--sjs-article-font-default-paragraphIndent': '0px',
    '--sjs-article-font-default-textCase': 'none',
    '--sjs-general-backcolor-dim': 'var(--accent)',
    '--sjs-primary-backcolor': 'var(--primary)',
    '--sjs-primary-backcolor-dark': 'var(--muted)',
    '--sjs-primary-backcolor-light': 'var(--muted-light)',
    '--sjs-primary-forecolor': 'var(--muted-foreground)',
    '--sjs-primary-forecolor-light': 'var(--background)',
    '--sjs-special-red': 'var(--destructive)',
    '--sjs-special-red-light': 'transparent',
    '--sjs-header-backcolor': 'transparent',
    '--page-title-font-size2': '24pt',

    '--sjs-font-editorfont-size': '10pt',
    '--sjs-font-editorfont-weight': '500',
  },
  header: {
    height: 100,
    inheritWidthFrom: 'survey',
  } as IHeader,
  headerView: 'basic',
  isPanelless: false,
  themeName: 'CustomTheme',
};

export default surveyTheme;
