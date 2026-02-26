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

import { renderHook } from '@testing-library/react';
import { Row } from '@tanstack/react-table';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import useTableActions from './useTableActions';

type TestData = { id: string; name: string };

const createMockRow = (original: TestData): Row<TestData> => ({ original }) as unknown as Row<TestData>;

describe('useTableActions', () => {
  const onClickMock = vi.fn();

  const basicConfig: TableActionsConfig<TestData> = [
    { type: STANDARD_ACTION_TYPES.ADD, onClick: onClickMock },
    { type: STANDARD_ACTION_TYPES.DELETE, onClick: onClickMock },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all actions when no visibility or disabled filters', () => {
    const { result } = renderHook(() => useTableActions(basicConfig, []));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].translationId).toBe('common.add');
    expect(result.current[0].icon).toEqual(faPlus);
    expect(result.current[1].translationId).toBe('common.delete');
    expect(result.current[1].icon).toEqual(faTrash);
  });

  it('filters out actions where visible returns false', () => {
    const config: TableActionsConfig<TestData> = [
      { type: STANDARD_ACTION_TYPES.ADD, onClick: onClickMock },
      { type: STANDARD_ACTION_TYPES.DELETE, onClick: onClickMock, visible: () => false },
    ];

    const { result } = renderHook(() => useTableActions(config, []));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].translationId).toBe('common.add');
  });

  it('marks actions as disabled where disabled returns true', () => {
    const config: TableActionsConfig<TestData> = [
      { type: STANDARD_ACTION_TYPES.ADD, onClick: onClickMock, disabled: true },
      { type: STANDARD_ACTION_TYPES.DELETE, onClick: onClickMock, disabled: false },
    ];

    const { result } = renderHook(() => useTableActions(config, []));

    expect(result.current[0].disabled).toBe(true);
    expect(result.current[1].disabled).toBe(false);
  });

  it('passes correct context with 0 selected rows', () => {
    const config: TableActionsConfig<TestData> = [
      {
        type: STANDARD_ACTION_TYPES.ADD,
        onClick: onClickMock,
        visible: (ctx) => !ctx.hasSelection,
      },
    ];

    const { result } = renderHook(() => useTableActions(config, []));

    expect(result.current).toHaveLength(1);
  });

  it('passes correct context with 1 selected row', () => {
    const row = createMockRow({ id: '1', name: 'Test' });

    const config: TableActionsConfig<TestData> = [
      {
        type: STANDARD_ACTION_TYPES.ADD,
        onClick: onClickMock,
        visible: (ctx) => ctx.isOneRowSelected,
      },
    ];

    const { result } = renderHook(() => useTableActions(config, [row]));

    expect(result.current).toHaveLength(1);
  });

  it('passes correct context with multiple selected rows', () => {
    const rows = [createMockRow({ id: '1', name: 'A' }), createMockRow({ id: '2', name: 'B' })];

    const config: TableActionsConfig<TestData> = [
      {
        type: STANDARD_ACTION_TYPES.ADD,
        onClick: onClickMock,
        visible: (ctx) => ctx.isOneRowSelected,
      },
      {
        type: STANDARD_ACTION_TYPES.DELETE,
        onClick: onClickMock,
        visible: (ctx) => ctx.hasSelection && !ctx.isOneRowSelected,
      },
    ];

    const { result } = renderHook(() => useTableActions(config, rows));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].translationId).toBe('common.delete');
  });

  it('returns empty array for empty config', () => {
    const { result } = renderHook(() => useTableActions([], []));

    expect(result.current).toEqual([]);
  });

  it('resolves addOrEdit type to edit when one row selected', () => {
    const row = createMockRow({ id: '1', name: 'Test' });

    const config: TableActionsConfig<TestData> = [{ type: STANDARD_ACTION_TYPES.ADD_OR_EDIT, onClick: onClickMock }];

    const { result } = renderHook(() => useTableActions(config, [row]));

    expect(result.current[0].translationId).toBe('common.edit');
    expect(result.current[0].icon).toEqual(faPencil);
  });

  it('resolves addOrEdit type to add when no rows selected', () => {
    const config: TableActionsConfig<TestData> = [{ type: STANDARD_ACTION_TYPES.ADD_OR_EDIT, onClick: onClickMock }];

    const { result } = renderHook(() => useTableActions(config, []));

    expect(result.current[0].translationId).toBe('common.add');
    expect(result.current[0].icon).toEqual(faPlus);
  });

  it('supports custom action type with custom icon and translationId', () => {
    const config: TableActionsConfig<TestData> = [
      {
        type: 'custom',
        icon: faPlus,
        translationId: 'custom.action',
        onClick: onClickMock,
      },
    ];

    const { result } = renderHook(() => useTableActions(config, []));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].translationId).toBe('custom.action');
    expect(result.current[0].icon).toEqual(faPlus);
  });

  it('uses disabled function with context', () => {
    const row = createMockRow({ id: '1', name: 'Test' });

    const config: TableActionsConfig<TestData> = [
      {
        type: STANDARD_ACTION_TYPES.DELETE,
        onClick: onClickMock,
        disabled: (ctx) => !ctx.hasSelection,
      },
    ];

    const noSelectionResult = renderHook(() => useTableActions(config, []));
    expect(noSelectionResult.result.current[0].disabled).toBe(true);

    const withSelectionResult = renderHook(() => useTableActions(config, [row]));
    expect(withSelectionResult.result.current[0].disabled).toBe(false);
  });
});
