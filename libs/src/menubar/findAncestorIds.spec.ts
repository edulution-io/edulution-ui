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
import findAncestorIds from './findAncestorIds';

const createItem = (id: string, children?: MenuItem[]): MenuItem => ({
  id,
  label: id,
  icon: '',
  action: () => undefined,
  children,
});

const buildDeepChain = (depth: number): { root: MenuItem[]; leafId: string; allIds: string[] } => {
  const allIds: string[] = [];
  const buildLevel = (currentDepth: number): MenuItem => {
    const id = `level-${currentDepth}`;
    allIds.push(id);
    if (currentDepth >= depth) return createItem(id);
    return createItem(id, [buildLevel(currentDepth + 1)]);
  };
  const root = [buildLevel(1)];
  return { root, leafId: `level-${depth}`, allIds };
};

describe('findAncestorIds', () => {
  it('returns empty array when target is not found', () => {
    const items = [createItem('a'), createItem('b')];
    expect(findAncestorIds(items, 'unknown')).toEqual([]);
  });

  it('returns empty array for empty items', () => {
    expect(findAncestorIds([], 'any')).toEqual([]);
  });

  it('returns single id for top-level match', () => {
    const items = [createItem('a'), createItem('b')];
    expect(findAncestorIds(items, 'b')).toEqual(['b']);
  });

  it('returns path for depth 2', () => {
    const items = [createItem('parent', [createItem('child')])];
    expect(findAncestorIds(items, 'child')).toEqual(['parent', 'child']);
  });

  it('returns path for depth 3', () => {
    const items = [createItem('a', [createItem('b', [createItem('c')])])];
    expect(findAncestorIds(items, 'c')).toEqual(['a', 'b', 'c']);
  });

  it('finds correct path among siblings', () => {
    const items = [createItem('x', [createItem('x1')]), createItem('y', [createItem('y1', [createItem('y2')])])];
    expect(findAncestorIds(items, 'y2')).toEqual(['y', 'y1', 'y2']);
  });

  it('returns path for depth 5', () => {
    const { root, leafId, allIds } = buildDeepChain(5);
    expect(findAncestorIds(root, leafId)).toEqual(allIds);
  });

  it('returns path for depth 10', () => {
    const { root, leafId, allIds } = buildDeepChain(10);
    const result = findAncestorIds(root, leafId);

    expect(result).toEqual(allIds);
    expect(result).toHaveLength(10);
  });

  it('finds intermediate node at depth 7 in a 10-level tree', () => {
    const { root } = buildDeepChain(10);
    const result = findAncestorIds(root, 'level-7');

    expect(result).toEqual(['level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6', 'level-7']);
    expect(result).toHaveLength(7);
  });

  it('finds top-level node in a deep tree', () => {
    const { root } = buildDeepChain(10);
    expect(findAncestorIds(root, 'level-1')).toEqual(['level-1']);
  });

  it('returns empty array for non-existent id in deep tree', () => {
    const { root } = buildDeepChain(10);
    expect(findAncestorIds(root, 'level-11')).toEqual([]);
  });
});
