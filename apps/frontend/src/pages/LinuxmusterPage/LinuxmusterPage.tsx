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
import getLoginScript from '@/pages/LinuxmusterPage/scripts/login';
import logoutScript from '@/pages/LinuxmusterPage/scripts/logout';
import APPS from '@libs/appconfig/constants/apps';
import NativeFrameScriptInjector from '@/components/structure/framing/Native/NativeFrameScriptInjector';

const LinuxmusterPage: React.FC = () => (
  <NativeFrameScriptInjector
    appName={APPS.LINUXMUSTER}
    getLoginScript={getLoginScript}
    logoutScript={logoutScript}
  />
);

export default LinuxmusterPage;
