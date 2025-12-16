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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdBuildCircle } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import DropdownMenu from '@/components/shared/DropdownMenu';
import cn from '@libs/common/utils/className';
import useMcpTools from '@/pages/Chat/hooks/useMcpTools';

const ToolSelector: React.FC = () => {
  const { t } = useTranslation();
  const { tools, enabledTools, isLoading, error, toggleTool, enableAllTools, disableAllTools, fetchTools } =
    useMcpTools();

  const enabledCount = enabledTools.length;
  const totalCount = tools.length;

  useEffect(() => {
    void fetchTools();
  }, [fetchTools]);

  if (isLoading && tools.length === 0) {
    return (
      <Button
        type="button"
        variant="btn-ghost"
        size="sm"
        className="flex items-center gap-1.5 text-muted-foreground"
        disabled
      >
        <MdBuildCircle className="h-4 w-4" />
        <span className="text-xs">...</span>
      </Button>
    );
  }

  if (error || tools.length === 0) {
    return null;
  }

  const menuItems = [
    {
      key: 'all',
      label: t('common.all'),
      onClick: enableAllTools,
      preventClose: true,
    },
    {
      key: 'none',
      label: t('common.none'),
      onClick: disableAllTools,
      preventClose: true,
    },
    {
      key: 'separator',
      label: '',
      isSeparator: true,
    },
    ...tools.map((tool) => ({
      key: tool.name,
      label: tool.description ? `${tool.name} – ${tool.description}` : tool.name,
      isCheckbox: true,
      checked: enabledTools.includes(tool.name),
      onCheckedChange: () => toggleTool(tool.name),
    })),
  ];

  return (
    <DropdownMenu
      trigger={
        <div
          className={cn(
            'flex cursor-pointer items-center gap-1.5 hover:opacity-80',
            enabledCount > 0 ? 'text-background' : 'text-muted-foreground',
          )}
        >
          <MdBuildCircle className="h-4 w-4" />
          <span className="text-xs">
            {enabledCount}/{totalCount}
          </span>
        </div>
      }
      items={menuItems}
      menuContentClassName="w-72"
    />
  );
};

export default ToolSelector;
