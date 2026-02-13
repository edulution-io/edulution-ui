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

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AccordionSH } from '@/components/ui/AccordionSH';
import Checkbox from '@/components/ui/Checkbox';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import type { SophomorixCheckResponse } from '@libs/userManagement/types/sophomorixCheckResponse';
import hasCheckOutputErrors from '@libs/userManagement/utils/hasCheckOutputErrors';
import SOPHOMORIX_OUTPUT_TYPES from '@libs/userManagement/constants/sophomorixOutputTypes';
import CHECK_RESULT_TAB_VALUES from '@libs/userManagement/constants/checkResultTabValues';
import AddTable from './AddTable';
import UpdateTable from './UpdateTable';
import KillTable from './KillTable';
import AccordionSection from './AccordionSection';
import ErrorTable from './ErrorTable';

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

  const { CHECK_RESULT, OUTPUT } = checkResult;
  const addEntries = CHECK_RESULT.ADD ?? {};
  const updateEntries = CHECK_RESULT.UPDATE ?? {};
  const killList = CHECK_RESULT.KILLLIST ?? [];
  const addCount = CHECK_RESULT.ADDLIST?.length ?? 0;
  const updateCount = CHECK_RESULT.UPDATELIST?.length ?? 0;
  const killCount = killList.length;
  const hasAdd = addCount > 0;
  const hasUpdate = updateCount > 0;
  const hasKill = killCount > 0;
  const hasAnyChanges = hasAdd || hasUpdate || hasKill;

  const errorBody = () => {
    const outputErrors = OUTPUT.filter((entry) => entry.TYPE === SOPHOMORIX_OUTPUT_TYPES.ERROR);
    const errorEntries = CHECK_RESULT.ERRORLIST ?? [];
    const errorDetails = CHECK_RESULT.ERROR ?? {};

    return (
      <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto scrollbar-thin">
        <div className="rounded-lg border border-red-500 bg-red-900/20 p-4">
          <div className="mb-2 flex items-center gap-2 font-bold text-red-400">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>{t('usermanagement.checkResult.checkFailed')}</span>
          </div>
          {errorEntries.length > 0 ? (
            <ErrorTable
              errorEntries={errorEntries}
              errorDetails={errorDetails}
            />
          ) : null}
          {outputErrors.length > 0 ? (
            <div className="flex flex-col gap-2 text-sm">
              {outputErrors.map((entry) => {
                const message = entry.MESSAGE_EN ?? entry.MESSAGE_DE ?? '';
                return <p key={message}>{message}</p>;
              })}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const overviewContent = hasAnyChanges ? (
    <div className="flex flex-col gap-2">
      <AccordionSH
        type="multiple"
        defaultValue={['add', 'update', 'kill']}
      >
        <AccordionSection
          value="add"
          label={t('usermanagement.checkResult.usersToAdd', { count: addCount })}
          count={addCount}
          headerClassName="bg-blue-600/20 text-blue-300"
        >
          {hasAdd ? <AddTable entries={addEntries} /> : null}
        </AccordionSection>

        <AccordionSection
          value="update"
          label={t('usermanagement.checkResult.usersToUpdate', { count: updateCount })}
          count={updateCount}
          headerClassName="bg-yellow-600/20 text-yellow-300"
        >
          {hasUpdate ? <UpdateTable entries={updateEntries} /> : null}
        </AccordionSection>

        <AccordionSection
          value="kill"
          label={t('usermanagement.checkResult.usersToDelete', { count: killCount })}
          count={killCount}
          headerClassName="bg-red-600/20 text-red-300"
        >
          {hasKill ? <KillTable logins={killList} /> : null}
        </AccordionSection>
      </AccordionSH>

      <div className="flex flex-col gap-2 pt-4">
        {hasAdd ? (
          <Checkbox
            label={t('usermanagement.checkResult.addNewUsers')}
            defaultChecked
            onCheckboxClick={() => setAddChecked((prev) => !prev)}
          />
        ) : null}
        {hasUpdate ? (
          <Checkbox
            label={t('usermanagement.checkResult.updateUsers')}
            defaultChecked
            onCheckboxClick={() => setUpdateChecked((prev) => !prev)}
          />
        ) : null}
        {hasKill ? (
          <Checkbox
            label={t('usermanagement.checkResult.deleteUsers')}
            defaultChecked
            onCheckboxClick={() => setKillChecked((prev) => !prev)}
          />
        ) : null}
      </div>
    </div>
  ) : (
    <p className="py-4 text-center text-muted-foreground">{t('usermanagement.checkResult.noChanges')}</p>
  );

  const successBody = () => (
    <div className="flex max-h-[80vh] flex-col overflow-y-auto scrollbar-thin">
      <Tabs defaultValue={CHECK_RESULT_TAB_VALUES.OVERVIEW}>
        <TabsList>
          <TabsTrigger value={CHECK_RESULT_TAB_VALUES.OVERVIEW}>{t('usermanagement.checkResult.overview')}</TabsTrigger>
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

        <TabsContent value={CHECK_RESULT_TAB_VALUES.OVERVIEW}>{overviewContent}</TabsContent>

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

  const body = isError ? errorBody() : successBody();

  const getFooter = () => {
    if (isError || !hasAnyChanges) {
      return (
        <DialogFooterButtons
          handleClose={onClose}
          cancelButtonText="common.close"
        />
      );
    }
    return (
      <DialogFooterButtons
        handleClose={onClose}
        handleSubmit={() => onApply(hasAdd && addChecked, hasUpdate && updateChecked, hasKill && killChecked)}
        submitButtonText="usermanagement.checkResult.apply"
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
      body={body}
      footer={getFooter()}
      desktopContentClassName="max-w-5xl max-h-[85vh]"
    />
  );
};

export default CheckResultDialog;
