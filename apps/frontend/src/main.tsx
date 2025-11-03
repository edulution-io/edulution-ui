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

import React from 'react';
import ReactDOM from 'react-dom/client';
import type SentryConfig from '@libs/common/types/sentryConfig';
import App from './App';
import useSentryStore from './store/useSentryStore';
import './index.scss';

import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/400-italic.css';

const sentryConfig = localStorage.getItem('sentryConfig');
if (sentryConfig) {
  const { state } = JSON.parse(sentryConfig) as { state: { config: SentryConfig } };
  void useSentryStore.getState().init(state.config);
}

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(<App />);

  const removeLoader = () => {
    root.classList.remove('loader');
    document.removeEventListener('DOMContentLoaded', removeLoader);
  };
  document.addEventListener('DOMContentLoaded', removeLoader);
}
