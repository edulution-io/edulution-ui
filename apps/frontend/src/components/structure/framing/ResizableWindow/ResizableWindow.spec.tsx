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

/* eslint-disable @typescript-eslint/no-explicit-any, react/button-has-type, react/display-name */

import React from 'react';

const mockSetWindowedFrameMinimized = vi.fn();
const mockSetWindowedFrameOpen = vi.fn();
const mockSetCurrentWindowedFrameSize = vi.fn();
const mockSetWindowedFramesZIndices = vi.fn();
const mockHandleClose = vi.fn();
const mockHasFramedWindowHighestZIndex = vi.fn().mockReturnValue(true);
const stableMinimizedWindowedFrames: string[] = [];
const stableWindowSize = { width: 1920, height: 1080 };
const stableWindowedFrameSizes: Record<string, any> = {};
const stableZIndices: Record<string, number> = { default: 0 };

vi.mock('react-rnd', () => ({ Rnd: (props: any) => props.children }));
vi.mock('@/hooks/useMedia', () => ({ default: () => ({ isMobileView: false }) }));
vi.mock('@edulution-io/ui-kit', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));
vi.mock('@/components/structure/framing/useFrameStore', () => ({
  default: () => ({
    minimizedWindowedFrames: stableMinimizedWindowedFrames,
    setWindowedFrameMinimized: mockSetWindowedFrameMinimized,
    setWindowedFrameOpen: mockSetWindowedFrameOpen,
    currentWindowedFrameSizes: stableWindowedFrameSizes,
    setCurrentWindowedFrameSize: mockSetCurrentWindowedFrameSize,
    windowedFramesZIndices: stableZIndices,
    setWindowedFramesZIndices: mockSetWindowedFramesZIndices,
    hasFramedWindowHighestZIndex: mockHasFramedWindowHighestZIndex,
  }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/useWindowResize', () => ({ default: () => stableWindowSize }));
vi.mock('@fortawesome/react-fontawesome', () => ({ FontAwesomeIcon: () => null }));
vi.mock('@fortawesome/free-solid-svg-icons', () => ({ faMaximize: 'faMaximize' }));
vi.mock('@libs/ui/constants', () => ({ SIDEBAR_WIDTH: 240 }));
vi.mock('@libs/ui/constants/resizableWindowElements', () => ({
  DEFAULT_MINIMIZED_BAR_HEIGHT: 29,
  MAXIMIZED_BAR_HEIGHT: 40,
}));
vi.mock('@libs/ui/constants/resizableWindowDefaultPosition', () => ({ default: { x: 50, y: 50 } }));
vi.mock('@libs/ui/constants/resizableWindowDefaultSize', () => ({ default: { width: 800, height: 600 } }));
vi.mock('@libs/ui/constants/sidebar', () => ({ MOBILE_TOP_BAR_HEIGHT_PX: 56 }));
vi.mock('@libs/ui/constants/appLayoutId', () => ({ default: 'app-layout' }));
vi.mock('@/components/structure/framing/ResizableWindow/Buttons/MinimizeButton', () => ({
  default: (props: any) =>
    React.createElement('button', { 'data-testid': 'minimize-btn', onClick: props.minimizeWindow }, 'minimize'),
}));
vi.mock('@/components/structure/framing/ResizableWindow/Buttons/ToggleMaximizeButton', () => ({
  default: (props: any) =>
    React.createElement(
      'button',
      {
        'data-testid': 'toggle-maximize-btn',
        'data-maximized': String(props.isMaximized),
        'data-minimized': String(props.isMinimized),
        onClick: props.handleMaximizeToggle,
      },
      'toggle-maximize',
    ),
}));
vi.mock('@/components/structure/framing/ResizableWindow/Buttons/CloseButton', () => ({
  default: (props: any) =>
    React.createElement(
      'button',
      { 'data-testid': 'close-btn', className: props.className, onClick: props.handleClose },
      'close',
    ),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResizableWindow from './ResizableWindow';

describe('ResizableWindow', () => {
  const defaultProps = {
    titleTranslationId: 'window.title',
    handleClose: mockHandleClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasFramedWindowHighestZIndex.mockReturnValue(true);
  });

  it('renders window with title', () => {
    render(<ResizableWindow {...defaultProps} />);
    expect(screen.getByText('window.title')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ResizableWindow {...defaultProps}>
        <div data-testid="child-content">Hello</div>
      </ResizableWindow>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('shows close button', () => {
    render(<ResizableWindow {...defaultProps} />);
    expect(screen.getByTestId('close-btn')).toBeInTheDocument();
  });

  it('calls handleClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(<ResizableWindow {...defaultProps} />);

    await user.click(screen.getByTestId('close-btn'));
    expect(mockHandleClose).toHaveBeenCalledOnce();
  });

  it('shows minimize button when not disabled', () => {
    render(
      <ResizableWindow
        {...defaultProps}
        disableMinimizeWindow={false}
      />,
    );
    expect(screen.getByTestId('minimize-btn')).toBeInTheDocument();
  });

  it('hides minimize button when disabled', () => {
    render(
      <ResizableWindow
        {...defaultProps}
        disableMinimizeWindow
      />,
    );
    expect(screen.queryByTestId('minimize-btn')).not.toBeInTheDocument();
  });

  it('shows maximize toggle button', () => {
    render(
      <ResizableWindow
        {...defaultProps}
        disableToggleMaximizeWindow={false}
      />,
    );
    expect(screen.getByTestId('toggle-maximize-btn')).toBeInTheDocument();
  });

  it('hides maximize toggle button when disabled and not minimized', () => {
    render(
      <ResizableWindow
        {...defaultProps}
        disableToggleMaximizeWindow
      />,
    );
    expect(screen.queryByTestId('toggle-maximize-btn')).not.toBeInTheDocument();
  });

  it('calls store methods on close', async () => {
    const user = userEvent.setup();
    render(<ResizableWindow {...defaultProps} />);

    await user.click(screen.getByTestId('close-btn'));
    expect(mockSetWindowedFrameMinimized).toHaveBeenCalledWith('window.title', false);
    expect(mockSetWindowedFrameOpen).toHaveBeenCalledWith('window.title', false);
  });

  it('calls setWindowedFramesZIndices on mount', () => {
    render(<ResizableWindow {...defaultProps} />);
    expect(mockSetWindowedFramesZIndices).toHaveBeenCalledWith('window.title');
  });
});
