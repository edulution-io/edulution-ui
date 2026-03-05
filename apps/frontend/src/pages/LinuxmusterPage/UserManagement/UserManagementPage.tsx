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
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Separator from '@/components/ui/Separator';
import { DropdownSelect } from '@/components';
import useMedia from '@/hooks/useMedia';
import PageLayout from '@/components/structure/layout/PageLayout';
import USER_MANAGEMENT_TABS from '@libs/userManagement/constants/userManagementTabs';
import { USER_MANAGEMENT_PATH } from '@libs/userManagement/constants/userManagementPaths';
import USER_TYPE_TO_MANAGEMENT_LIST from '@libs/userManagement/constants/userTypeToManagementList';
import USER_TYPES from '@libs/userManagement/constants/userTypes';
import USER_TYPE_ICONS from '@libs/userManagement/constants/userTypeIcons';
import ADMIN_SUB_TABS from '@libs/userManagement/constants/adminSubTabs';
import ALL_TAB_OPTIONS from '@libs/userManagement/constants/allTabOptions';
import type UserType from '@libs/userManagement/types/userType';
import SchoolSelectorDropdown from '@/components/shared/SchoolSelectorDropdown';
import useLdapGroups from '@/hooks/useLdapGroups';
import UserTable from './components/UserTable/UserTable';
import ListManagementTab from './components/ListManagement/ListManagementTab';
import UserManagementFloatingButtons from './components/ListManagement/UserManagementFloatingButtons';
import UserDetailsDialog from './components/UserTable/UserDetailsDialog';
import useUserManagementStore from './useUserManagementStore';
import useRegisterUserManagementSections from './useRegisterUserManagementSections';

interface UserManagementPageProps {
  userType: UserType;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ userType }) => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useMedia();
  const { tabId } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useLdapGroups();
  const { selectedUserDetails, setSelectedUserDetails } = useUserManagementStore();
  useRegisterUserManagementSections();

  const adminSubTabs = ADMIN_SUB_TABS[userType];
  const showSchoolSelector = isSuperAdmin && userType !== USER_TYPES.GLOBALADMINS;

  const managementList = USER_TYPE_TO_MANAGEMENT_LIST[userType];
  const hasList = managementList !== null;

  const defaultTab = adminSubTabs ? adminSubTabs[0].id : USER_MANAGEMENT_TABS.TABLE;
  const tabValue = tabId || defaultTab;

  const filteredTabOptions = useMemo(
    () => (hasList ? ALL_TAB_OPTIONS : ALL_TAB_OPTIONS.filter((opt) => opt.id !== USER_MANAGEMENT_TABS.LIST)),
    [hasList],
  );

  const tabOptions = useMemo(() => {
    if (adminSubTabs) {
      return adminSubTabs.map((tab) => ({ id: tab.id, name: t(tab.nameKey), nameKey: tab.nameKey }));
    }
    return filteredTabOptions.map((opt) => ({ ...opt, name: t(opt.nameKey) }));
  }, [t, adminSubTabs, filteredTabOptions]);

  const goToTab = (id: string) => {
    navigate(`/${USER_MANAGEMENT_PATH}/${userType}/${id}`);
  };

  const showFloatingButtons = !adminSubTabs && hasList && tabValue === USER_MANAGEMENT_TABS.LIST;

  useEffect(
    () => () => {
      setSelectedUserDetails(null);
    },
    [userType],
  );

  const nativeAppHeader = {
    title: t(`usermanagement.${userType}`),
    description: t('usermanagement.description'),
    iconSrc: USER_TYPE_ICONS[userType],
  };

  if (adminSubTabs) {
    if (!isMobileView && !isTabletView) {
      return (
        <PageLayout nativeAppHeader={nativeAppHeader}>
          <Tabs
            value={tabValue}
            className="flex h-full flex-col pt-1"
          >
            <div className="sticky top-0 z-20 backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-4">
                <TabsList
                  className="grid sm:w-fit"
                  style={{ gridTemplateColumns: `repeat(${adminSubTabs.length}, minmax(0, 1fr))` }}
                >
                  {tabOptions.map((item) => (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      onClick={() => goToTab(item.id)}
                      className="text-[clamp(0.65rem,2vw,0.8rem)] xl:min-w-64"
                    >
                      {item.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="ml-auto">{showSchoolSelector && <SchoolSelectorDropdown />}</div>
              </div>
              <Separator className="my-2 bg-muted" />
            </div>
            {adminSubTabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="flex-1 overflow-hidden"
              >
                <UserTable userType={tab.subUserType} />
              </TabsContent>
            ))}
          </Tabs>
          {selectedUserDetails && <UserDetailsDialog />}
        </PageLayout>
      );
    }

    return (
      <PageLayout nativeAppHeader={nativeAppHeader}>
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-20">
            <div className="mb-2 flex flex-col gap-2">
              {showSchoolSelector && <SchoolSelectorDropdown />}
              <DropdownSelect
                options={tabOptions}
                selectedVal={tabValue}
                handleChange={goToTab}
              />
            </div>
            <Separator className="my-2 bg-muted" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {adminSubTabs.map((tab) =>
              tabValue === tab.id ? (
                <UserTable
                  key={tab.id}
                  userType={tab.subUserType}
                />
              ) : null,
            )}
          </div>
          {selectedUserDetails && <UserDetailsDialog />}
        </div>
      </PageLayout>
    );
  }

  if (!isMobileView && !isTabletView) {
    return (
      <PageLayout nativeAppHeader={nativeAppHeader}>
        <Tabs
          value={tabValue}
          className="flex h-full flex-col pt-1"
        >
          <div className="sticky top-0 z-20 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-4">
              <TabsList
                className="grid sm:w-fit"
                style={{ gridTemplateColumns: `repeat(${filteredTabOptions.length}, minmax(0, 1fr))` }}
              >
                {tabOptions.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    onClick={() => goToTab(item.id)}
                    className="text-[clamp(0.65rem,2vw,0.8rem)] xl:min-w-64"
                  >
                    {item.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="ml-auto">{isSuperAdmin && <SchoolSelectorDropdown />}</div>
            </div>
            <Separator className="my-2 bg-muted" />
          </div>
          <TabsContent
            value={USER_MANAGEMENT_TABS.TABLE}
            className="flex-1 overflow-hidden"
          >
            <UserTable userType={userType} />
          </TabsContent>
          <TabsContent
            value={USER_MANAGEMENT_TABS.LIST}
            className="flex-1 overflow-hidden"
          >
            <ListManagementTab userType={userType} />
          </TabsContent>
        </Tabs>
        {showFloatingButtons && <UserManagementFloatingButtons userType={userType} />}
        {selectedUserDetails && <UserDetailsDialog />}
      </PageLayout>
    );
  }

  return (
    <PageLayout nativeAppHeader={nativeAppHeader}>
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-20">
          <div className="mb-2 flex flex-col gap-2">
            {isSuperAdmin && <SchoolSelectorDropdown />}
            <DropdownSelect
              options={tabOptions}
              selectedVal={tabValue}
              handleChange={goToTab}
            />
          </div>
          <Separator className="my-2 bg-muted" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {tabValue === USER_MANAGEMENT_TABS.TABLE ? (
            <UserTable userType={userType} />
          ) : (
            <ListManagementTab userType={userType} />
          )}
        </div>
        {showFloatingButtons && <UserManagementFloatingButtons userType={userType} />}
        {selectedUserDetails && <UserDetailsDialog />}
      </div>
    </PageLayout>
  );
};

export default UserManagementPage;
