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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-use-before-define, jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/role-has-required-aria-props, react/button-has-type, react/display-name, react/no-array-index-key, no-underscore-dangle, no-plusplus */

vi.mock('@/pages/FileSharing/FilePreview/FileSharingPreviewFrame', () => ({
  default: () => <div data-testid="file-sharing-preview-frame" />,
}));
vi.mock('@/pages/UserSettings/Info/CommunityLicenseDialog', () => ({
  default: () => <div data-testid="community-license-dialog" />,
}));
vi.mock('@/pages/ConferencePage/BBBIFrame', () => ({
  default: () => <div data-testid="bbb-frame" />,
}));
vi.mock('@/pages/DesktopDeployment/VDIFrame', () => ({
  default: () => <div data-testid="vdi-frame" />,
}));
vi.mock('@/pages/UserSettings/Security/components/SetupMfaDialog', () => ({
  default: () => <div data-testid="setup-mfa-dialog" />,
}));
vi.mock('@/components/structure/framing/Native/NativeFrameManager', () => ({
  default: () => <div data-testid="native-frame-manager" />,
}));
vi.mock('@/components/structure/framing/EmbeddedFrameManager', () => ({
  default: () => <div data-testid="embedded-frame-manager" />,
}));
vi.mock('@/components/ui/Launcher/Launcher', () => ({
  default: () => <div data-testid="launcher" />,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import Overlays from './Overlays';

describe('Overlays', () => {
  it('renders all overlay child components', () => {
    render(<Overlays />);
    expect(screen.getByTestId('file-sharing-preview-frame')).toBeInTheDocument();
    expect(screen.getByTestId('community-license-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('bbb-frame')).toBeInTheDocument();
    expect(screen.getByTestId('vdi-frame')).toBeInTheDocument();
    expect(screen.getByTestId('setup-mfa-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('native-frame-manager')).toBeInTheDocument();
    expect(screen.getByTestId('embedded-frame-manager')).toBeInTheDocument();
    expect(screen.getByTestId('launcher')).toBeInTheDocument();
  });

  it('renders exactly 8 overlay components', () => {
    const { container } = render(<Overlays />);
    expect(container.children).toHaveLength(8);
  });
});
