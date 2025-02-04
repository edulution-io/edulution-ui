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
