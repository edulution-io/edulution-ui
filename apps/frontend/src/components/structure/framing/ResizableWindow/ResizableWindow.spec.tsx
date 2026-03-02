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

const mockSetWindowedFrameMinimized = vi.fn();
const mockSetWindowedFrameOpen = vi.fn();
const mockSetCurrentWindowedFrameSize = vi.fn();
const mockSetWindowedFramesZIndices = vi.fn();
const mockHasFramedWindowHighestZIndex = vi.fn().mockReturnValue(true);

vi.mock('react-rnd', () => ({
  Rnd: ({ children, ...props }: any) => (
    <div data-testid="rnd-container" data-drag-disabled={String(props.disableDragging)}>
      {children}
    </div>
  ),
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: any) => node,
  };
});

vi.mock('@/hooks/useMedia', () => ({
  default: () => ({ isMobileView: false }),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@/components/structure/framing/useFrameStore', () => ({
  default: () => ({
    minimizedWindowedFrames: [],
    setWindowedFrameMinimized: mockSetWindowedFrameMinimized,
    setWindowedFrameOpen: mockSetWindowedFrameOpen,
    currentWindowedFrameSizes: {},
    setCurrentWindowedFrameSize: mockSetCurrentWindowedFrameSize,
    windowedFramesZIndices: { default: 0 },
    setWindowedFramesZIndices: mockSetWindowedFramesZIndices,
    hasFramedWindowHighestZIndex: mockHasFramedWindowHighestZIndex,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useWindowResize', () => ({
  default: () => ({ width: 1920, height: 1080 }),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faMaximize: 'faMaximize',
}));

vi.mock('@libs/ui/constants', () => ({
  SIDEBAR_WIDTH: 240,
}));

vi.mock('@libs/ui/constants/resizableWindowElements', () => ({
  DEFAULT_MINIMIZED_BAR_HEIGHT: 29,
  MAXIMIZED_BAR_HEIGHT: 40,
}));

vi.mock('@libs/ui/constants/resizableWindowDefaultPosition', () => ({
  default: { x: 50, y: 50 },
}));

vi.mock('@libs/ui/constants/resizableWindowDefaultSize', () => ({
  default: { width: 800, height: 600 },
}));

vi.mock('@libs/ui/constants/sidebar', () => ({
  MOBILE_TOP_BAR_HEIGHT_PX: 56,
}));

vi.mock('@libs/ui/constants/appLayoutId', () => ({
  default: 'app-layout',
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/MinimizeButton', () => ({
  default: ({ minimizeWindow }: any) => (
    <button data-testid="minimize-btn" onClick={minimizeWindow}>
      minimize
    </button>
  ),
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/ToggleMaximizeButton', () => ({
  default: ({ handleMaximizeToggle, isMaximized, isMinimized }: any) => (
    <button
      data-testid="toggle-maximize-btn"
      data-maximized={String(isMaximized)}
      data-minimized={String(isMinimized)}
      onClick={handleMaximizeToggle}
    >
      toggle-maximize
    </button>
  ),
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/CloseButton', () => ({
  default: ({ handleClose, className }: any) => (
    <button data-testid="close-btn" className={className} onClick={handleClose}>
      close
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResizableWindow from './ResizableWindow';

describe('ResizableWindow', () => {
  const defaultProps = {
    titleTranslationId: 'window.title',
    handleClose: vi.fn(),
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
    const handleClose = vi.fn();
    render(<ResizableWindow {...defaultProps} handleClose={handleClose} />);

    await user.click(screen.getByTestId('close-btn'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('shows minimize button when not disabled', () => {
    render(<ResizableWindow {...defaultProps} disableMinimizeWindow={false} />);
    expect(screen.getByTestId('minimize-btn')).toBeInTheDocument();
  });

  it('hides minimize button when disabled', () => {
    render(<ResizableWindow {...defaultProps} disableMinimizeWindow />);
    expect(screen.queryByTestId('minimize-btn')).not.toBeInTheDocument();
  });

  it('shows maximize toggle button', () => {
    render(<ResizableWindow {...defaultProps} disableToggleMaximizeWindow={false} />);
    expect(screen.getByTestId('toggle-maximize-btn')).toBeInTheDocument();
  });

  it('hides maximize toggle button when disabled and not minimized', () => {
    render(<ResizableWindow {...defaultProps} disableToggleMaximizeWindow />);
    expect(screen.queryByTestId('toggle-maximize-btn')).not.toBeInTheDocument();
  });

  it('renders inside an Rnd container', () => {
    render(<ResizableWindow {...defaultProps} />);
    expect(screen.getByTestId('rnd-container')).toBeInTheDocument();
  });

  it('calls setWindowedFrameMinimized on close', async () => {
    const user = userEvent.setup();
    render(<ResizableWindow {...defaultProps} />);

    await user.click(screen.getByTestId('close-btn'));
    expect(mockSetWindowedFrameMinimized).toHaveBeenCalledWith('window.title', false);
    expect(mockSetWindowedFrameOpen).toHaveBeenCalledWith('window.title', false);
  });
});
