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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { faSave, faUserPlus, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import type UserType from '@libs/userManagement/types/userType';
import USER_TYPE_TO_MANAGEMENT_LIST from '@libs/userManagement/constants/userTypeToManagementList';
import { createEmptyEntry } from '@libs/userManagement/utils/csvUtils';
import useUserManagementStore from '../../useUserManagementStore';

interface UserManagementFloatingButtonsProps {
  userType: UserType;
}

const UserManagementFloatingButtons: React.FC<UserManagementFloatingButtonsProps> = ({ userType }) => {
  const { t } = useTranslation();
  const { selectedSchool } = useClassManagementStore();
  const { isSaving, saveManagementList, fetchManagementList } = useUserManagementStore();

  const managementList = USER_TYPE_TO_MANAGEMENT_LIST[userType];

  const getFilteredEntries = () => {
    if (!managementList) return [];
    const { managementListEntries, deletedEntryIndices } = useUserManagementStore
      .getState()
      .getListData(managementList);
    const deletedSet = new Set(deletedEntryIndices);
    return managementListEntries.filter((_, i) => !deletedSet.has(i));
  };

  const handleSave = async () => {
    if (selectedSchool && managementList) {
      await saveManagementList(selectedSchool, managementList, getFilteredEntries());
    }
  };

  const handleRevert = async () => {
    if (selectedSchool && managementList) {
      await fetchManagementList(selectedSchool, managementList, true);
    }
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
    ],
    keyPrefix: 'user-management-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default UserManagementFloatingButtons;
