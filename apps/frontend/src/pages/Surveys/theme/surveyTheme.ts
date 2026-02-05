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

import { IHeader, ITheme } from 'survey-core';

const surveyTheme: ITheme = {
  cssVariables: {
    '--sjs-corner-radius': '3px',
    '--sjs-base-unit': '8px',
    '--sjs-shadow-small': '0px 1px 2px 0px rgba(0, 0, 0, 0.35)',
    '--sjs-shadow-inner': 'inset 0px 1px 2px 0px rgba(0, 0, 0, 0.2)',
    '--sjs-border-default': 'var(--ring)',
    '--sjs-border-light': 'var(--ring)',
    '--sjs-general-forecolor': 'var(--background)',
    '--sjs-general-forecolor-light': 'var(--secondary-background)',
    '--sjs-general-forecolor-dark': 'var(--secondary-background)',
    '--sjs-general-dim-forecolor': 'var(--accent)',
    '--sjs-general-dim-forecolor-light': 'var(--accent-light)',
    '--sjs-general-backcolor': 'var(--accent)',
    '--sjs-general-backcolor-dark': 'var(--accent)',
    '--sjs-general-backcolor-dim': 'transparent',
    '--sjs-general-backcolor-dim-light': 'var(--accent)',
    '--sjs-general-backcolor-dim-dark': 'var(--accent-light)',
    '--sjs-secondary-backcolor': 'var(--accent)',
    '--sjs-secondary-backcolor-light': 'var(--accent-light)',
    '--sjs-secondary-backcolor-semi-light': 'var(--accent-light)',
    '--sjs-question-background': 'var(--foreground)',
    '--sjs-secondary-forecolor': 'var(--secondary-foreground)',
    '--sjs-secondary-forecolor-light': 'var(--secondary-foreground)',
    '--sjs-editorpanel-color': 'var(--foreground)',
    '--sjs-editorpanel-backcolor': 'var(--muted-background)',
    '--sjs-shadow-small-reset': '0px 0px 0px 0px var(--accent)',
    '--sjs-shadow-medium': '0px 2px 6px 0px var(--accent)',
    '--sjs-shadow-large': '0px 8px 16px 0px var(--accent)',
    '--sjs-shadow-inner-reset': 'inset 0px 0px 0px 0px var(--accent)',
    '--sjs-border-inside': 'var(--ring)',
    '--sjs-special-red-forecolor': 'var(--destructive)',
    '--sjs-special-green': 'var(--ci-light-green)',
    '--sjs-special-green-light': 'var(--ci-light-green)',
    '--sjs-special-green-forecolor': 'var(--ci-light-green)',
    '--sjs-special-blue': 'var(--ci-dark-blue)',
    '--sjs-special-blue-light': 'var(--ci-dark-blue)',
    '--sjs-special-blue-forecolor': 'var(--ci-dark-blue)',
    '--sjs-special-yellow': 'var(--accent)',
    '--sjs-special-yellow-light': 'var(--accent)',
    '--sjs-special-yellow-forecolor': 'var(--accent-light)',
    '--sjs-primary-backcolor': 'var(--primary)',
    '--sjs-primary-backcolor-dark': 'var(--accent)',
    '--sjs-primary-backcolor-light': 'var(--muted-background)',
    '--sjs-primary-forecolor': 'var(--accent-foreground)',
    '--sjs-primary-forecolor-light': 'var(--background)',
    '--sjs-special-red': 'var(--destructive)',
    '--sjs-special-red-light': 'var(--destructive-light)',
    '--sjs-header-backcolor': 'transparent',
    '--sjs-font-surveytitle-color': 'var(--primary)',
    '--sjs-font-editorfont-color': 'var(--background)',
    '--sjs-font-pagetitle-color': 'var(--ring)',
    '--sjs-font-pagedescription-color': 'var(--background)',
    '--sjs-questionpanel-backcolor': 'var(--accent)',
    '--sjs-questionpanel-backcolor-light': 'var(--accent-light)',
    '--sjs-questionpanel-backcolor-dark': 'var(--accent-light)',
    '--sjs-font-questiontitle-color': 'var(--background)',
    '--sjs-font-questiondescription-color': 'var(--muted-foreground)',
    '--ctr-button-background-color': 'var(--accent)',
    '--ctr-button-background-color-hovered': 'var(--accent-light)',
    '--ctr-button-border-color-focused': 'transparent',
    '--scrollbar-thumb': 'var(--muted-foreground)',
    '--ctr-scrollbar-background-color': 'var(--muted-background)',
    '--sjs-icon-color': 'var(--ring)',
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
