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
import CommunityLicenseDialog from '@/pages/UserSettings/Info/CommunityLicenseDialog';
import BBBFrame from '@/pages/ConferencePage/BBBIFrame';
import VDIFrame from '@/pages/DesktopDeployment/VDIFrame';
import SetupMfaDialog from '@/pages/UserSettings/Security/components/SetupMfaDialog';
import NativeFrameManager from '@/components/structure/framing/Native/NativeFrameManager';
import EmbeddedFrameManager from '@/components/structure/framing/EmbeddedFrameManager';
import Launcher from '@/components/ui/Launcher/Launcher';

const Overlays = () => (
  <>
    <FileSharingPreviewFrame />
    <BBBFrame />
    <VDIFrame />
    <EmbeddedFrameManager />
    <NativeFrameManager />
    <CommunityLicenseDialog />
    <SetupMfaDialog />
    <Launcher />
  </>
);

export default Overlays;
