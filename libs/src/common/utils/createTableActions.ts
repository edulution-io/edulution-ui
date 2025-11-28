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

import TableAction from '../types/tableAction';
import { TableActionConfig, TableActionContext, TableActionsConfig } from '../types/tableActionsConfig';
import STANDARD_ACTION_TYPES from '../constants/standardActionTypes';
import STANDARD_ACTION_ICONS from '../constants/standardActionIcons';
import StandardActionType from '../types/standardActionType';

const STANDARD_TRANSLATION_IDS: Record<StandardActionType, string> = {
  [STANDARD_ACTION_TYPES.ADD]: 'common.add',
  [STANDARD_ACTION_TYPES.EDIT]: 'common.edit',
  [STANDARD_ACTION_TYPES.ADD_OR_EDIT]: 'common.add',
  [STANDARD_ACTION_TYPES.DELETE]: 'common.delete',
};

const resolveCondition = <TData>(
  condition: boolean | ((context: TableActionContext<TData>) => boolean) | undefined,
  context: TableActionContext<TData>,
  defaultValue: boolean,
): boolean => {
  if (condition === undefined) {
    return defaultValue;
  }
  if (typeof condition === 'function') {
    return condition(context);
  }
  return condition;
};

const createTableAction = <TData>(
  config: TableActionConfig<TData>,
  context: TableActionContext<TData>,
): TableAction<TData> | null => {
  const isVisible = resolveCondition(config.visible, context, true);
  if (!isVisible) {
    return null;
  }

  const isDisabled = resolveCondition(config.disabled, context, false);

  if (config.type === 'custom') {
    return {
      icon: config.icon,
      translationId: config.translationId,
      onClick: config.onClick,
      className: config.className,
      disabled: isDisabled,
    };
  }

  let resolvedType = config.type;
  if (config.type === STANDARD_ACTION_TYPES.ADD_OR_EDIT) {
    resolvedType = context.isOneRowSelected ? STANDARD_ACTION_TYPES.EDIT : STANDARD_ACTION_TYPES.ADD;
  }

  const icon =
    resolvedType === STANDARD_ACTION_TYPES.EDIT
      ? STANDARD_ACTION_ICONS[STANDARD_ACTION_TYPES.EDIT]
      : STANDARD_ACTION_ICONS[resolvedType];
  const translationId = config.translationId ?? STANDARD_TRANSLATION_IDS[resolvedType];

  return {
    icon,
    translationId,
    onClick: config.onClick,
    className: config.className,
    disabled: isDisabled,
  };
};

const createTableActions = <TData>(
  configs: TableActionsConfig<TData>,
  context: TableActionContext<TData>,
): TableAction<TData>[] =>
  configs
    .map((config) => createTableAction(config, context))
    .filter((action): action is TableAction<TData> => action !== null);

export default createTableActions;
