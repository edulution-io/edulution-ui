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

// This Interface is based on a config definition from OnlyOffice.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

interface OnlyOfficeEditorConfig {
  document: {
    fileType: string;
    type: 'desktop' | 'mobile';
    key: string;
    title: string;
    url: string;
    height: string;
    width: string;
  };
  documentType: string;
  token: string;
  editorConfig: {
    lang: string;
    mode: 'view' | 'edit';
    callbackUrl: string;
    customization: {
      mentionShare: boolean;
      macros: boolean;
      autosave: boolean;
      comments: boolean;
      uiTheme: string;
      compactToolbar: boolean;
      plugins: boolean;
      forcesave: boolean;
      toolbarNoTabs: boolean;
      zoom: number;
      integrationMode: string;
      compatibleFeatures: boolean;
      help: boolean;
      compactHeader: boolean;
      unit: string;
      hideRightMenu: boolean;
      anonymous: { request: boolean; label: string };
      mobileForceView: boolean;
      macrosMode: string;
      hideRulers: boolean;
      toolbarHideFileName: boolean;
    };
  };
}

export default OnlyOfficeEditorConfig;
