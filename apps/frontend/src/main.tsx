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
import ReactDOM from 'react-dom/client';
import type SentryConfig from '@libs/common/types/sentryConfig';
import App from './App';
import useSentryStore from './store/useSentryStore';
import useThemeStore from './store/useThemeStore';
import './index.scss';

import '@edulution-io/ui-kit/styles/fonts';

const sentryConfig = localStorage.getItem('sentryConfig');
if (sentryConfig) {
  const { state } = JSON.parse(sentryConfig) as { state: { config: SentryConfig } };
  void useSentryStore.getState().init(state.config);
}

useThemeStore.getState().initTheme();

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(<App />);

  const removeLoader = () => {
    root.classList.remove('loader');
    document.removeEventListener('DOMContentLoaded', removeLoader);
  };
  document.addEventListener('DOMContentLoaded', removeLoader);
}
