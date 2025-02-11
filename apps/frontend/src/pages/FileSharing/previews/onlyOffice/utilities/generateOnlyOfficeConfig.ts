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

import OnlyOfficeConfig from '@libs/filesharing/types/OnlyOfficeConfig';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';

interface OnlyOfficeConfigProps {
  fileType: string;
  type: 'desktop' | 'mobile';
  editorType: OnlyOfficeConfig;
  documentTitle: string;
  documentUrl: string;
  callbackUrl: string;
  mode: 'view' | 'edit';
  username: string;
  lang: string;
}

const generateOnlyOfficeConfig = ({
  fileType,
  type,
  editorType: { documentType, key },
  documentTitle,
  documentUrl,
  callbackUrl,
  mode,
  lang,
}: OnlyOfficeConfigProps): OnlyOfficeEditorConfig => ({
  document: {
    fileType,
    type,
    key,
    title: documentTitle,
    url: documentUrl,
    height: '100%',
    width: '100%',
  },
  documentType,
  token: '',
  editorConfig: {
    lang,
    callbackUrl,
    mode,
    customization: {
      anonymous: {
        request: false,
        label: 'Guest',
      },
      autosave: true,
      comments: true,
      compactHeader: false,
      compactToolbar: false,
      compatibleFeatures: false,
      forcesave: false,
      help: true,
      hideRightMenu: false,
      hideRulers: false,
      integrationMode: 'embed',
      macros: true,
      macrosMode: 'Warn',
      mentionShare: false,
      mobileForceView: true,
      plugins: true,
      toolbarHideFileName: false,
      toolbarNoTabs: false,
      uiTheme: 'theme-dark',
      unit: 'cm',
      zoom: mode === 'view' ? 50 : 100,
    },
  },
});

export default generateOnlyOfficeConfig;
