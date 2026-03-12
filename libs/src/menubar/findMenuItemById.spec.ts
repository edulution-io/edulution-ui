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

import MenuItem from './menuItem';
import findMenuItemById from './findMenuItemById';

const createItem = (id: string, children?: MenuItem[]): MenuItem => ({
  id,
  label: id,
  icon: '',
  action: () => undefined,
  children,
});

const buildDeepChain = (depth: number): { root: MenuItem[]; leafId: string } => {
  const buildLevel = (currentDepth: number): MenuItem => {
    const id = `level-${currentDepth}`;
    if (currentDepth >= depth) return createItem(id);
    return createItem(id, [buildLevel(currentDepth + 1)]);
  };
  return { root: [buildLevel(1)], leafId: `level-${depth}` };
};

describe('findMenuItemById', () => {
  it('returns null when target is not found', () => {
    const items = [createItem('a'), createItem('b')];
    expect(findMenuItemById(items, 'unknown')).toBeNull();
  });

  it('returns null for empty items', () => {
    expect(findMenuItemById([], 'any')).toBeNull();
  });

  it('finds top-level item', () => {
    const items = [createItem('a'), createItem('b')];
    const result = findMenuItemById(items, 'b');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('b');
  });

  it('finds item at depth 2', () => {
    const items = [createItem('parent', [createItem('child')])];
    const result = findMenuItemById(items, 'child');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('child');
  });

  it('finds item at depth 3', () => {
    const items = [createItem('a', [createItem('b', [createItem('c')])])];
    const result = findMenuItemById(items, 'c');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('c');
  });

  it('finds correct item among siblings', () => {
    const items = [createItem('x', [createItem('x1')]), createItem('y', [createItem('y1', [createItem('target')])])];
    const result = findMenuItemById(items, 'target');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('target');
  });

  it('finds item at depth 5', () => {
    const { root, leafId } = buildDeepChain(5);
    const result = findMenuItemById(root, leafId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(leafId);
  });

  it('finds item at depth 10', () => {
    const { root, leafId } = buildDeepChain(10);
    const result = findMenuItemById(root, leafId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(leafId);
  });

  it('finds intermediate item at depth 7 in a 10-level tree', () => {
    const { root } = buildDeepChain(10);
    const result = findMenuItemById(root, 'level-7');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('level-7');
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0].id).toBe('level-8');
  });

  it('returns the actual item reference', () => {
    const child = createItem('child');
    const items = [createItem('parent', [child])];
    const result = findMenuItemById(items, 'child');

    expect(result).toBe(child);
  });

  it('returns null for non-existent id in deep tree', () => {
    const { root } = buildDeepChain(10);
    expect(findMenuItemById(root, 'level-11')).toBeNull();
  });
});
