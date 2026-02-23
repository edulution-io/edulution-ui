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

import React, { useEffect, useMemo } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';
import AiServiceTableColumns from '@/pages/Settings/AIService/AiServiceTableColumns';
import CreateAndUpdateAiServiceDialog from '@/pages/Settings/AIService/CreateAndUpdateAiServiceDialog';
import AiServiceResponseDto from '@libs/aiService/types/aiServiceResponseDto';
import AI_SERVICE_TABLE_COLUMNS from '@libs/aiService/constants/aiServiceTableColumns';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import useTableActions from '@/hooks/useTableActions';

const AiServicePage = () => {
  const { tableContentData, fetchTableContent, isDialogOpen, setIsDialogOpen, isLoading } = useAiServiceTableStore();

  useEffect(() => {
    void fetchTableContent();
  }, [fetchTableContent, isDialogOpen]);

  const actionsConfig = useMemo<TableActionsConfig<AiServiceResponseDto>>(
    () => [
      {
        type: STANDARD_ACTION_TYPES.ADD_OR_EDIT,
        onClick: () => setIsDialogOpen(true),
      },
    ],
    [],
  );

  const tableActions = useTableActions(actionsConfig, []);

  return (
    <>
      <ScrollableTable
        columns={AiServiceTableColumns}
        data={tableContentData}
        filterKey={AI_SERVICE_TABLE_COLUMNS.NAME}
        filterPlaceHolderText="settings.aiServices.searchPlaceholder"
        applicationName="settings.aiServices.title"
        enableRowSelection={false}
        isLoading={isLoading}
        actions={tableActions}
      />
      <CreateAndUpdateAiServiceDialog />
    </>
  );
};

export default AiServicePage;
