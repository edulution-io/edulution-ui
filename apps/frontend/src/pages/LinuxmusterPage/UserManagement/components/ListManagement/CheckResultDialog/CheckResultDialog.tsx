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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import type { SophomorixCheckResponse } from '@libs/userManagement/types/sophomorixCheckResponse';
import hasCheckOutputErrors from '@libs/userManagement/utils/hasCheckOutputErrors';
import CHECK_RESULT_TAB_VALUES from '@libs/userManagement/constants/checkResultTabValues';
import AddTable from './AddTable';
import UpdateTable from './UpdateTable';
import KillTable from './KillTable';
import OverviewTab from './OverviewTab';
import ErrorBody from './ErrorBody';

interface CheckResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checkResult: SophomorixCheckResponse | null;
  onApply: (add: boolean, update: boolean, kill: boolean) => void;
  isApplying: boolean;
  isLoading: boolean;
}

const CheckResultDialog: React.FC<CheckResultDialogProps> = ({
  isOpen,
  onClose,
  checkResult,
  onApply,
  isApplying,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [addChecked, setAddChecked] = useState(true);
  const [updateChecked, setUpdateChecked] = useState(true);
  const [killChecked, setKillChecked] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(CHECK_RESULT_TAB_VALUES.OVERVIEW);

  useEffect(() => {
    if (isOpen) {
      setAddChecked(true);
      setUpdateChecked(true);
      setKillChecked(true);
      setActiveTab(CHECK_RESULT_TAB_VALUES.OVERVIEW);
    }
  }, [isOpen]);

  const isError = useMemo(() => checkResult && hasCheckOutputErrors(checkResult), [checkResult]);

  if (isLoading) {
    return (
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={onClose}
        title={t('usermanagement.checkResult.title')}
        body={
          <div className="flex flex-1 items-center justify-center">
            <CircleLoader />
          </div>
        }
        desktopContentClassName="max-w-5xl max-h-[85vh]"
      />
    );
  }

  if (!checkResult) return null;

  const { CHECK_RESULT } = checkResult;
  const addEntries = CHECK_RESULT.ADD ?? {};
  const updateEntries = CHECK_RESULT.UPDATE ?? {};
  const killList = CHECK_RESULT.KILLLIST ?? [];
  const hasAdd = (CHECK_RESULT.ADDLIST?.length ?? 0) > 0;
  const hasUpdate = (CHECK_RESULT.UPDATELIST?.length ?? 0) > 0;
  const hasKill = killList.length > 0;
  const hasAnyChanges = hasAdd || hasUpdate || hasKill;

  const getBody = () => {
    if (isApplying) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <CircleLoader />
        </div>
      );
    }
    if (isError) return <ErrorBody checkResult={checkResult} />;
    return (
      <div className="flex max-h-[80vh] flex-col overflow-y-auto text-base scrollbar-thin">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value={CHECK_RESULT_TAB_VALUES.OVERVIEW}>
              {t('usermanagement.checkResult.overview')}
            </TabsTrigger>
            {hasAdd ? (
              <TabsTrigger value={CHECK_RESULT_TAB_VALUES.ADD}>{t('usermanagement.checkResult.add')}</TabsTrigger>
            ) : null}
            {hasUpdate ? (
              <TabsTrigger value={CHECK_RESULT_TAB_VALUES.UPDATE}>{t('usermanagement.checkResult.update')}</TabsTrigger>
            ) : null}
            {hasKill ? (
              <TabsTrigger value={CHECK_RESULT_TAB_VALUES.DELETE}>{t('usermanagement.checkResult.delete')}</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value={CHECK_RESULT_TAB_VALUES.OVERVIEW}>
            <OverviewTab
              checkResult={CHECK_RESULT}
              addChecked={addChecked}
              updateChecked={updateChecked}
              killChecked={killChecked}
              onAddCheckedChange={() => setAddChecked((prev) => !prev)}
              onUpdateCheckedChange={() => setUpdateChecked((prev) => !prev)}
              onKillCheckedChange={() => setKillChecked((prev) => !prev)}
            />
          </TabsContent>

          {hasAdd ? (
            <TabsContent value={CHECK_RESULT_TAB_VALUES.ADD}>
              <AddTable entries={addEntries} />
            </TabsContent>
          ) : null}

          {hasUpdate ? (
            <TabsContent value={CHECK_RESULT_TAB_VALUES.UPDATE}>
              <UpdateTable entries={updateEntries} />
            </TabsContent>
          ) : null}

          {hasKill ? (
            <TabsContent value={CHECK_RESULT_TAB_VALUES.DELETE}>
              <KillTable logins={killList} />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    );
  };

  const getSubmitAction = (): { label: string; handler: () => void } => {
    switch (activeTab) {
      case CHECK_RESULT_TAB_VALUES.ADD:
        return { label: 'usermanagement.checkResult.add', handler: () => onApply(true, false, false) };
      case CHECK_RESULT_TAB_VALUES.UPDATE:
        return { label: 'usermanagement.checkResult.update', handler: () => onApply(false, true, false) };
      case CHECK_RESULT_TAB_VALUES.DELETE:
        return { label: 'usermanagement.checkResult.delete', handler: () => onApply(false, false, true) };
      default:
        return {
          label: 'usermanagement.checkResult.apply',
          handler: () => onApply(hasAdd && addChecked, hasUpdate && updateChecked, hasKill && killChecked),
        };
    }
  };

  const getFooter = () => {
    if (isError || !hasAnyChanges) {
      return (
        <DialogFooterButtons
          handleClose={onClose}
          cancelButtonText="common.close"
        />
      );
    }
    const { label, handler } = getSubmitAction();
    return (
      <DialogFooterButtons
        handleClose={onClose}
        handleSubmit={handler}
        submitButtonText={label}
        disableSubmit={isApplying}
        disableCancel={isApplying}
      />
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t('usermanagement.checkResult.title')}
      body={getBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-5xl max-h-[85vh]"
    />
  );
};

export default CheckResultDialog;
