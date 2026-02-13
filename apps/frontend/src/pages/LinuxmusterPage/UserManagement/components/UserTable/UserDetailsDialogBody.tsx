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
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';
import SOPHOMORIX_STATUS_CLASS_MAP from '@libs/userManagement/constants/sophomorixStatusClassMap';
import formatSophomorixDate from '@libs/userManagement/utils/formatSophomorixDate';
import { extractCnFromDn, isManagementGroup } from '@libs/userManagement/utils/dnUtils';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import Quota from '@/pages/Dashboard/Quota';

interface UserDetailsDialogBodyProps {
  user: LmnUserInfo;
  quota: QuotaResponse | null;
}

const UserDetailsDialogBody: React.FC<UserDetailsDialogBodyProps> = ({ user, quota }) => {
  const { t } = useTranslation();
  const neverLabel = t('common.never');

  const statusClass = SOPHOMORIX_STATUS_CLASS_MAP[user.sophomorixStatus || ''] || 'bg-gray-500';
  const statusText = user.sophomorixStatus ? t(`usermanagement.sophomorixStatusValues.${user.sophomorixStatus}`) : '-';

  const unid = user.sophomorixUnid && user.sophomorixUnid !== '---' ? user.sophomorixUnid : undefined;

  const properties = [
    { label: t('usermanagement.loginname'), value: user.cn },
    { label: t('usermanagement.class'), value: user.sophomorixAdminClass },
    {
      label: t('usermanagement.sophomorixStatus'),
      value: <span className={`rounded px-2 py-1 text-xs text-white ${statusClass}`}>{statusText}</span>,
    },
    { label: t('usermanagement.role'), value: user.sophomorixRole },
    { label: t('usermanagement.schoolname'), value: user.sophomorixSchoolname },
    { label: t('usermanagement.birthdate'), value: user.sophomorixBirthdate },
    { label: t('usermanagement.userId'), value: unid },
    { label: t('usermanagement.mailAlias'), value: user.proxyAddresses?.join(', ') },
    {
      label: t('usermanagement.creationDate'),
      value: formatSophomorixDate(user.sophomorixCreationDate, neverLabel),
    },
    {
      label: t('usermanagement.deactivationDate'),
      value: formatSophomorixDate(user.sophomorixDeactivationDate, neverLabel),
    },
    {
      label: t('usermanagement.tolerationDate'),
      value: formatSophomorixDate(user.sophomorixTolerationDate, neverLabel),
    },
  ];

  const allMembers = user.memberOf ?? [];
  const regularGroups = allMembers.filter((dn) => !isManagementGroup(dn)).map(extractCnFromDn);
  const managementGroups = allMembers.filter(isManagementGroup).map(extractCnFromDn);

  return (
    <div className="space-y-4 text-base text-background">
      <AccordionSH
        type="multiple"
        defaultValue={['properties']}
      >
        <AccordionItem value="properties">
          <AccordionTrigger className="w-full text-start text-lg font-bold">
            {t('usermanagement.properties')}
          </AccordionTrigger>
          <AccordionContent className="overflow-auto">
            <table className="w-full table-fixed">
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.label}>
                    <td className="w-1/2 border p-2 text-left">{prop.label}</td>
                    <td className="w-1/2 border p-2">{prop.value || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="groups">
          <AccordionTrigger className="w-full text-start text-lg font-bold">
            {t('usermanagement.groupMembership')}
          </AccordionTrigger>
          <AccordionContent className="overflow-auto">
            <div className="grid grid-cols-2 items-start gap-4">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">{t('common.groups')}</th>
                  </tr>
                </thead>
                <tbody>
                  {regularGroups.length > 0 ? (
                    regularGroups.map((group) => (
                      <tr key={group}>
                        <td className="border p-2">{group}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border p-2 text-muted-foreground">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {managementGroups.length > 0 ? (
                    managementGroups.map((group) => (
                      <tr key={group}>
                        <td className="border p-2">{group}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border p-2 text-muted-foreground">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="quota">
          <AccordionTrigger className="w-full text-start text-lg font-bold">
            {t('usermanagement.quota')}
          </AccordionTrigger>
          <AccordionContent className="overflow-auto">
            {quota ? (
              <Quota
                user={user}
                quotaData={quota}
              />
            ) : (
              <div className="text-muted-foreground">{t('usermanagement.noQuotaInfo')}</div>
            )}
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>
    </div>
  );
};

export default UserDetailsDialogBody;
