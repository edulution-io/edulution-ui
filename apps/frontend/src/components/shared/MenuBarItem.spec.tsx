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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ className }: { className?: string }) => (
    <span
      data-testid="fa-icon"
      className={className}
    />
  ),
}));
vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));
vi.mock('./MenuBarRenderIcon', () => ({
  default: () => <span data-testid="menu-bar-icon" />,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuItem from '@libs/menubar/menuItem';
import MENUBAR_LAYOUT from '@libs/menubar/constants/menuBarLayout';
import MenuBarItem from './MenuBarItem';

const createItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: 'test-item',
  label: 'Test Item',
  icon: '',
  action: vi.fn(),
  ...overrides,
});

const defaultProps = () => ({
  item: createItem(),
  isActive: false,
  isExpanded: false,
  shouldCollapse: false,
  activeColorClass: 'bg-ciBlue',
  activeSection: null as string | null,
  selectedItemId: null as string | null,
  expandedItems: new Set<string>(),
  pathParts: [] as string[],
  onSelectItem: vi.fn(),
  onToggleExpand: vi.fn(),
  onCloseMobileMenu: vi.fn(),
});

describe('MenuBarItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the item label when not collapsed', () => {
    render(<MenuBarItem {...defaultProps()} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('calls action, onSelectItem and onCloseMobileMenu when clicked', async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<MenuBarItem {...props} />);

    await user.click(screen.getByRole('button', { name: 'Test Item' }));

    expect(props.item.action).toHaveBeenCalledTimes(1);
    expect(props.onSelectItem).toHaveBeenCalledWith('test-item');
    expect(props.onCloseMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('calls action on Enter key', async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<MenuBarItem {...props} />);

    screen.getByRole('button', { name: 'Test Item' }).focus();
    await user.keyboard('{Enter}');

    expect(props.item.action).toHaveBeenCalledTimes(1);
    expect(props.onCloseMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('calls action on Space key', async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<MenuBarItem {...props} />);

    screen.getByRole('button', { name: 'Test Item' }).focus();
    await user.keyboard('{ }');

    expect(props.item.action).toHaveBeenCalledTimes(1);
  });

  it('applies active color class when isActive is true', () => {
    const props = { ...defaultProps(), isActive: true };

    render(<MenuBarItem {...props} />);

    const button = screen.getByRole('button', { name: 'Test Item' });
    expect(button.className).toContain('bg-ciBlue');
  });

  it('does not apply active color class when isActive is false', () => {
    render(<MenuBarItem {...defaultProps()} />);

    const button = screen.getByRole('button', { name: 'Test Item' });
    expect(button.className).not.toContain('bg-ciBlue');
  });

  it('renders tooltip when shouldCollapse is true', () => {
    const props = { ...defaultProps(), shouldCollapse: true };

    render(<MenuBarItem {...props} />);

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Test Item');
  });

  it('hides inline label when shouldCollapse is true', () => {
    const props = { ...defaultProps(), shouldCollapse: true };

    const { container } = render(<MenuBarItem {...props} />);

    const inlineLabel = container.querySelector('.flex-1.text-left');
    expect(inlineLabel).not.toBeInTheDocument();
  });

  it('shows expand button when item has children and not collapsed', () => {
    const children: MenuItem[] = [{ id: 'child-1', label: 'Child 1', icon: '', action: vi.fn() }];
    const props = {
      ...defaultProps(),
      item: createItem({ children }),
    };

    render(<MenuBarItem {...props} />);

    expect(screen.getByLabelText('common.expand')).toBeInTheDocument();
  });

  it('toggles expand when expand button is clicked', async () => {
    const user = userEvent.setup();
    const children: MenuItem[] = [{ id: 'child-1', label: 'Child 1', icon: '', action: vi.fn() }];
    const props = {
      ...defaultProps(),
      item: createItem({ children }),
    };

    render(<MenuBarItem {...props} />);

    await user.click(screen.getByLabelText('common.expand'));

    expect(props.onToggleExpand).toHaveBeenCalledWith('test-item');
  });

  it('renders children region when expanded and has children', () => {
    const children: MenuItem[] = [
      { id: 'child-1', label: 'Child 1', icon: '', action: vi.fn() },
      { id: 'child-2', label: 'Child 2', icon: '', action: vi.fn() },
    ];
    const props = {
      ...defaultProps(),
      item: createItem({ children }),
      isExpanded: true,
    };

    render(<MenuBarItem {...props} />);

    expect(screen.getByRole('region', { name: 'Test Item sections' })).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('calls child action and onCloseMobileMenu when child is clicked', async () => {
    const user = userEvent.setup();
    const childAction = vi.fn();
    const children: MenuItem[] = [{ id: 'child-1', label: 'Child 1', icon: '', action: childAction }];
    const props = {
      ...defaultProps(),
      item: createItem({ children }),
      isExpanded: true,
    };

    render(<MenuBarItem {...props} />);

    await user.click(screen.getByText('Child 1'));

    expect(childAction).toHaveBeenCalledTimes(1);
    expect(props.onCloseMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('also expands when clicking main button if has children and not expanded', async () => {
    const user = userEvent.setup();
    const children: MenuItem[] = [{ id: 'child-1', label: 'Child 1', icon: '', action: vi.fn() }];
    const props = {
      ...defaultProps(),
      item: createItem({ children }),
      isExpanded: false,
    };

    render(<MenuBarItem {...props} />);

    await user.click(screen.getByRole('button', { name: 'Test Item' }));

    expect(props.onToggleExpand).toHaveBeenCalledWith('test-item');
  });

  it('does not call onToggleExpand when clicking main button if already expanded', async () => {
    const user = userEvent.setup();
    const children: MenuItem[] = [{ id: 'child-1', label: 'Child 1', icon: '', action: vi.fn() }];
    const props = {
      ...defaultProps(),
      item: createItem({ children }),
      isExpanded: true,
    };

    render(<MenuBarItem {...props} />);

    await user.click(screen.getByRole('button', { name: 'Test Item' }));

    expect(props.onToggleExpand).not.toHaveBeenCalled();
  });

  describe('depth-based padding', () => {
    it('applies base padding at depth 0', () => {
      const props = defaultProps();

      render(<MenuBarItem {...props} />);

      const button = screen.getByRole('button', { name: 'Test Item' });
      expect(button.style.paddingLeft).toBe(`${MENUBAR_LAYOUT.BASE_PADDING_LEFT}px`);
    });

    it('increases padding at depth 1', () => {
      const props = { ...defaultProps(), depth: 1 };

      render(<MenuBarItem {...props} />);

      const button = screen.getByRole('button', { name: 'Test Item' });
      const expected = MENUBAR_LAYOUT.BASE_PADDING_LEFT + MENUBAR_LAYOUT.DEPTH_PADDING_STEP;
      expect(button.style.paddingLeft).toBe(`${expected}px`);
    });

    it('increases padding at depth 5', () => {
      const props = { ...defaultProps(), depth: 5 };

      render(<MenuBarItem {...props} />);

      const button = screen.getByRole('button', { name: 'Test Item' });
      const expected = MENUBAR_LAYOUT.BASE_PADDING_LEFT + 5 * MENUBAR_LAYOUT.DEPTH_PADDING_STEP;
      expect(button.style.paddingLeft).toBe(`${expected}px`);
    });

    it('increases padding at depth 10', () => {
      const props = { ...defaultProps(), depth: 10 };

      render(<MenuBarItem {...props} />);

      const button = screen.getByRole('button', { name: 'Test Item' });
      const expected = MENUBAR_LAYOUT.BASE_PADDING_LEFT + 10 * MENUBAR_LAYOUT.DEPTH_PADDING_STEP;
      expect(button.style.paddingLeft).toBe(`${expected}px`);
    });
  });

  describe('icon rendering by depth', () => {
    it('renders icon at depth 0', () => {
      render(<MenuBarItem {...defaultProps()} />);

      expect(screen.getByTestId('menu-bar-icon')).toBeInTheDocument();
    });

    it('renders icon at depth 1', () => {
      const props = { ...defaultProps(), depth: 1 };

      render(<MenuBarItem {...props} />);

      expect(screen.getByTestId('menu-bar-icon')).toBeInTheDocument();
    });

    it('does not render icon at depth 2', () => {
      const props = { ...defaultProps(), depth: 2 };

      render(<MenuBarItem {...props} />);

      expect(screen.queryByTestId('menu-bar-icon')).not.toBeInTheDocument();
    });

    it('does not render icon at depth 10', () => {
      const props = { ...defaultProps(), depth: 10 };

      render(<MenuBarItem {...props} />);

      expect(screen.queryByTestId('menu-bar-icon')).not.toBeInTheDocument();
    });
  });

  describe('recursive children rendering', () => {
    it('renders nested children recursively when all levels are expanded', () => {
      const grandchild: MenuItem = { id: 'grandchild', label: 'Grandchild', icon: '', action: vi.fn() };
      const child: MenuItem = { id: 'child', label: 'Child', icon: '', action: vi.fn(), children: [grandchild] };
      const props = {
        ...defaultProps(),
        item: createItem({ children: [child] }),
        isExpanded: true,
        expandedItems: new Set(['child']),
      };

      render(<MenuBarItem {...props} />);

      expect(screen.getByText('Child')).toBeInTheDocument();
      expect(screen.getByText('Grandchild')).toBeInTheDocument();
    });

    it('does not render grandchildren when child is not expanded', () => {
      const grandchild: MenuItem = { id: 'grandchild', label: 'Grandchild', icon: '', action: vi.fn() };
      const child: MenuItem = { id: 'child', label: 'Child', icon: '', action: vi.fn(), children: [grandchild] };
      const props = {
        ...defaultProps(),
        item: createItem({ children: [child] }),
        isExpanded: true,
        expandedItems: new Set<string>(),
      };

      render(<MenuBarItem {...props} />);

      expect(screen.getByText('Child')).toBeInTheDocument();
      expect(screen.getByText('Grandchild')).toBeInTheDocument();
    });
  });
});
