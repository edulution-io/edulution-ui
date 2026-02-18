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

import React, { useMemo } from 'react';
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
import ADMIN_SUB_TABS from '@libs/userManagement/constants/adminSubTabs';
import ALL_TAB_OPTIONS from '@libs/userManagement/constants/allTabOptions';
import type UserType from '@libs/userManagement/types/userType';
import { LinuxmusterIcon } from '@/assets/icons';
import useRegisterUserManagementSections from './useRegisterUserManagementSections';

interface UserManagementPageExampleProps {
  userType: UserType;
}

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex h-64 items-center justify-center text-muted-foreground">
    <span>{label}</span>
  </div>
);

const UserManagementPageExample: React.FC<UserManagementPageExampleProps> = ({ userType }) => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useMedia();
  const { tabId } = useParams();
  const navigate = useNavigate();
  useRegisterUserManagementSections();

  const adminSubTabs = ADMIN_SUB_TABS[userType];
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

  const nativeAppHeader = {
    title: t(`usermanagement.${userType}`),
    description: t('usermanagement.description'),
    iconSrc: LinuxmusterIcon,
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
              </div>
              <Separator className="my-2 bg-muted" />
            </div>
            {adminSubTabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="flex-1 overflow-y-auto scrollbar-thin"
              >
                <Placeholder label={t(tab.nameKey)} />
              </TabsContent>
            ))}
          </Tabs>
        </PageLayout>
      );
    }

    return (
      <PageLayout nativeAppHeader={nativeAppHeader}>
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-20">
            <div className="mb-2 flex flex-col gap-2">
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
                <Placeholder
                  key={tab.id}
                  label={t(tab.nameKey)}
                />
              ) : null,
            )}
          </div>
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
            </div>
            <Separator className="my-2 bg-muted" />
          </div>
          <TabsContent
            value={USER_MANAGEMENT_TABS.TABLE}
            className="flex-1 overflow-y-auto scrollbar-thin"
          >
            <Placeholder label={t('usermanagement.tabs.table')} />
          </TabsContent>
          {hasList && (
            <TabsContent
              value={USER_MANAGEMENT_TABS.LIST}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              <Placeholder label={t('usermanagement.tabs.list')} />
            </TabsContent>
          )}
        </Tabs>
      </PageLayout>
    );
  }

  return (
    <PageLayout nativeAppHeader={nativeAppHeader}>
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-20">
          <div className="mb-2 flex flex-col gap-2">
            <DropdownSelect
              options={tabOptions}
              selectedVal={tabValue}
              handleChange={goToTab}
            />
          </div>
          <Separator className="my-2 bg-muted" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Placeholder label={t(`usermanagement.tabs.${tabValue}`)} />
        </div>
      </div>
    </PageLayout>
  );
};

export default UserManagementPageExample;
