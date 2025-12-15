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
        <Button
          type="button"
          variant="btn-ghost"
          size="sm"
          className={cn('flex items-center gap-1.5', enabledCount > 0 ? 'text-accent' : 'text-muted-foreground')}
        >
          <MdBuildCircle className="h-4 w-4" />
          <span className="text-xs">
            {enabledCount}/{totalCount}
          </span>
        </Button>
      }
      items={menuItems}
      menuContentClassName="w-72"
    />
  );
};

export default ToolSelector;
