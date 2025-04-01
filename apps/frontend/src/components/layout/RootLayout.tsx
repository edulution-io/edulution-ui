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
import FileSharingPreviewFrame from '@/pages/FileSharing/FilePreview/FileSharingPreviewFrame';
import { Outlet } from 'react-router-dom';
import NativeFrames from '@/components/framing/Native/NativeFrames';
import CommunityLicenseDialog from '@/pages/UserSettings/Info/CommunityLicenseDialog';
import BBBFrame from '@/pages/ConferencePage/BBBIFrame';
import VDIFrame from '@/pages/DesktopDeployment/VDIFrame';
import EmbeddedIframes from '@/components/framing/EmbeddedIframes';
import SetupMfaDialog from '@/pages/UserSettings/Security/components/SetupMfaDialog';

const RootLayout = () => (
  <>
    <FileSharingPreviewFrame />
    <BBBFrame />
    <VDIFrame />
    <EmbeddedIframes />
    <NativeFrames />
    <CommunityLicenseDialog />
    <SetupMfaDialog />
    <Outlet />
  </>
);

export default RootLayout;
