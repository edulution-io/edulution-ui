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
import UserCard from '@/pages/ClassManagement/LessonPage/UserArea/UserCard';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import { useTranslation } from 'react-i18next';
import LessonFloatingButtonsBar from '@/pages/ClassManagement/LessonPage/LessonFloatingButtonsBar';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import sortByName from '@libs/common/utils/sortByName';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/useUserStore';
import Checkbox from '@/components/ui/Checkbox';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import useQuotaInfo from '@/hooks/useQuotaInfo';
import QuotaThresholdPercent from '@libs/filesharing/constants/quotaThresholdPercent';
import SOPHOMORIX_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixGroupTypes';

const UserArea = ({ fetchData }: { fetchData: () => Promise<void> }) => {
  const { t } = useTranslation();
  const { user: teacher } = useLmnApiStore();
  const { user } = useUserStore();
  const { member } = useLessonStore();
  const { appConfigs } = useAppConfigsStore();
  const [selectedMember, setSelectedMember] = useState<LmnUserInfo[]>([]);
  const selectedMemberCount = selectedMember.length;
  const { percentageUsed } = useQuotaInfo();

  const isQuotaExceeded = percentageUsed > QuotaThresholdPercent.CRITICAL;

  const isTeacherInSameClass = useMemo(() => {
    if (!teacher || !user) return () => false;

    const teacherClasses = teacher.memberOf.filter((teacherClass) =>
      teacher.schoolclasses.some((userClass) => teacherClass.includes(userClass)),
    );

    return (student: LmnUserInfo): boolean => teacherClasses.some((tc) => student.memberOf.includes(tc));
  }, [teacher, user]);

  const { members, selectableMembers } = useMemo(() => {
    const filteredMembers = member.filter((m) =>
      [SOPHOMORIX_GROUP_TYPES.STUDENT, SOPHOMORIX_GROUP_TYPES.TEACHER].includes(m.sophomorixRole),
    );
    return {
      members: filteredMembers,
      selectableMembers: filteredMembers.filter(
        (m) => m.sophomorixRole === SOPHOMORIX_GROUP_TYPES.STUDENT && isTeacherInSameClass(m),
      ),
    };
  }, [member]);

  const isVeyonEnabled = useMemo(() => {
    const veyonConfigs = getExtendedOptionsValue(appConfigs, APPS.CLASS_MANAGEMENT, ExtendedOptionKeys.VEYON_PROXYS);
    return Array.isArray(veyonConfigs) && veyonConfigs.length > 0;
  }, [appConfigs]);

  const getSelectedStudents = () => {
    if (selectedMemberCount) {
      return selectedMember.filter((m) => m.sophomorixRole === SOPHOMORIX_GROUP_TYPES.STUDENT);
    }
    return selectableMembers;
  };

  const areAllChecked = selectedMember.length === selectableMembers.length;

  const onCheckAll = () => {
    if (!areAllChecked) {
      setSelectedMember(selectableMembers);
    } else setSelectedMember([]);
  };

  return (
    <>
      <div className="flex items-center">
        <div
          className="flew-row ml-2 flex cursor-pointer"
          onClickCapture={onCheckAll}
        >
          <Checkbox
            className="color-white scale-125 rounded-lg"
            checked={areAllChecked}
            aria-label={t('select')}
          />
          <p className="ml-2 text-background">{t('selectAll')}</p>
        </div>

        <h3 className="mb-2 flex flex-grow justify-center text-center text-lg text-background md:text-xl">
          {members.length} {t('classmanagement.usersInThisSession')}{' '}
          {selectedMemberCount ? `(${selectedMemberCount} ${t('common.selected')})` : null}
        </h3>
      </div>
      <div className="flex flex-wrap overflow-y-auto scrollbar-thin">
        {members.sort(sortByName).map((m) => (
          <UserCard
            key={m.dn}
            user={m}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            isTeacherInSameClass={isTeacherInSameClass(m)}
            isVeyonEnabled={isVeyonEnabled}
          />
        ))}
      </div>
      <LessonFloatingButtonsBar
        fetchData={fetchData}
        students={getSelectedStudents()}
        isVeyonEnabled={isVeyonEnabled}
        isMemberSelected={!!selectedMemberCount}
        isQuotaExceeded={isQuotaExceeded}
      />
    </>
  );
};

export default UserArea;
