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
import { toast } from 'sonner';
import { faCheck, faFileCsv, faRotateLeft, faSave, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useSchoolStore from '@/store/useSchoolStore';
import type UserType from '@libs/userManagement/types/userType';
import USER_TYPE_TO_MANAGEMENT_LIST from '@libs/userManagement/constants/userTypeToManagementList';
import {
  createEmptyEntry,
  csvToEntriesWithComments,
  entriesToCsvWithComments,
  entriesToRows,
} from '@libs/userManagement/utils/csvUtils';
import type { SophomorixCheckResponse } from '@libs/userManagement/types/sophomorixCheckResponse';
import validateListRows from '@libs/userManagement/utils/validateListRows';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useUserManagementStore from '../../useUserManagementStore';
import CsvDialog from '../../../components/CsvDialog';
import CheckResultDialog from './CheckResultDialog/CheckResultDialog';

interface UserManagementFloatingButtonsProps {
  userType: UserType;
}

const UserManagementFloatingButtons: React.FC<UserManagementFloatingButtonsProps> = ({ userType }) => {
  const { t } = useTranslation();
  const selectedSchool = useSchoolStore((s) => s.selectedSchool);
  const {
    isSaving,
    isCheckLoading,
    isApplying,
    saveManagementList,
    fetchManagementList,
    runSophomorixCheck,
    runSophomorixApply,
  } = useUserManagementStore();
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isCheckDialogOpen, setIsCheckDialogOpen] = useState(false);
  const [checkResult, setCheckResult] = useState<SophomorixCheckResponse | null>(null);

  const managementList = USER_TYPE_TO_MANAGEMENT_LIST[userType];

  const getFilteredEntries = () => {
    if (!managementList) return [];
    const { managementListEntries, deletedEntryIndices } = useUserManagementStore
      .getState()
      .getListData(managementList);
    const deletedSet = new Set(deletedEntryIndices);
    return managementListEntries.filter((_, i) => !deletedSet.has(i));
  };

  const validateEntries = (): boolean => {
    if (!managementList) return true;
    const rows = entriesToRows(getFilteredEntries(), managementList);
    if (!validateListRows(rows, managementList)) {
      toast.error(t('usermanagement.validationFailed'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (selectedSchool && managementList && validateEntries()) {
      await saveManagementList(selectedSchool, managementList, getFilteredEntries());
    }
  };

  const handleCheckClick = () => {
    if (!validateEntries()) return;
    setIsSaveConfirmOpen(true);
  };

  const handleConfirmSaveAndCheck = async () => {
    setIsSaveConfirmOpen(false);
    setCheckResult(null);
    setIsCheckDialogOpen(true);
    if (selectedSchool && managementList) {
      await saveManagementList(selectedSchool, managementList, getFilteredEntries(), true);
      if (useUserManagementStore.getState().error) {
        setIsCheckDialogOpen(false);
        return;
      }
    }
    const result = await runSophomorixCheck();
    if (result) {
      setCheckResult(result);
    } else {
      setIsCheckDialogOpen(false);
    }
  };

  const handleRevert = async () => {
    if (selectedSchool && managementList) {
      await fetchManagementList(selectedSchool, managementList, true);
    }
  };

  const handleApplyFromDialog = async (add: boolean, update: boolean, kill: boolean) => {
    if (selectedSchool) {
      await runSophomorixApply(selectedSchool, add, update, kill);
      setIsCheckDialogOpen(false);
      if (managementList) {
        await fetchManagementList(selectedSchool, managementList, true);
      }
    }
  };

  const initialCsv = useMemo(() => {
    if (!isCsvDialogOpen || !managementList) return '';
    return entriesToCsvWithComments(
      useUserManagementStore.getState().getListData(managementList).commentEntries,
      useUserManagementStore.getState().getListData(managementList).managementListEntries,
      managementList,
    );
  }, [isCsvDialogOpen, managementList]);

  const handleCsvSave = (csvText: string) => {
    if (!managementList) return;
    const { entries, commentEntries } = csvToEntriesWithComments(csvText, managementList);
    const store = useUserManagementStore.getState();
    store.setManagementListEntries(managementList, entries);
    store.setCommentEntries(managementList, commentEntries);
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: faUserPlus,
        text: t('usermanagement.addUser'),
        onClick: () => {
          const currentEntries = useUserManagementStore.getState().getListData(managementList!).managementListEntries;
          useUserManagementStore
            .getState()
            .setManagementListEntries(managementList!, [...currentEntries, createEmptyEntry(managementList!)]);
        },
        isVisible: !!managementList,
      },
      {
        icon: faRotateLeft,
        text: t('common.revert'),
        onClick: () => {
          void handleRevert();
        },
        isVisible: !!managementList && !isSaving,
      },
      {
        icon: faSave,
        text: t('common.save'),
        onClick: () => {
          void handleSave();
        },
        isVisible: !!managementList && !isSaving,
      },
      {
        icon: faCheck,
        text: t('usermanagement.check'),
        onClick: handleCheckClick,
        isVisible: !isSaving,
      },
      {
        icon: faFileCsv,
        text: t('usermanagement.csv.title'),
        onClick: () => setIsCsvDialogOpen(true),
        isVisible: !!managementList,
      },
    ],
    keyPrefix: 'user-management-floating-button_',
  };

  return (
    <>
      <FloatingButtonsBar config={config} />
      {managementList && selectedSchool ? (
        <CsvDialog
          isOpen={isCsvDialogOpen}
          onClose={() => setIsCsvDialogOpen(false)}
          title={`/etc/linuxmuster/sophomorix/${selectedSchool}/${managementList}.csv`}
          initialCsv={initialCsv}
          onSave={handleCsvSave}
          downloadFilename={`${managementList}.csv`}
        />
      ) : null}
      <AdaptiveDialog
        isOpen={isSaveConfirmOpen}
        handleOpenChange={() => setIsSaveConfirmOpen(false)}
        title={t('usermanagement.saveConfirmTitle')}
        body={<p>{t('usermanagement.saveConfirmMessage')}</p>}
        footer={
          <DialogFooterButtons
            handleClose={() => setIsSaveConfirmOpen(false)}
            handleSubmit={() => {
              void handleConfirmSaveAndCheck();
            }}
            submitButtonText="usermanagement.check"
          />
        }
      />
      <CheckResultDialog
        isOpen={isCheckDialogOpen}
        onClose={() => setIsCheckDialogOpen(false)}
        checkResult={checkResult}
        onApply={(add, update, kill) => {
          void handleApplyFromDialog(add, update, kill);
        }}
        isApplying={isApplying}
        isLoading={isSaving || isCheckLoading}
      />
    </>
  );
};

export default UserManagementFloatingButtons;
