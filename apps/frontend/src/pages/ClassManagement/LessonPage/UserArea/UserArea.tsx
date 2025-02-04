/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useMemo, useState } from 'react';
import UserCard from '@/pages/ClassManagement/LessonPage/UserArea/UserCard';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { useTranslation } from 'react-i18next';
import LessonFloatingButtonsBar from '@/pages/ClassManagement/LessonPage/LessonFloatingButtonsBar';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { SOPHOMORIX_STUDENT } from '@libs/lmnApi/constants/sophomorixRoles';
import sortByName from '@libs/common/utils/sortByName';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/UserStore';
import Checkbox from '@/components/ui/Checkbox';
import useElementHeight from '@/hooks/useElementHeight';
import { FILTER_BAR_ID, LESSON_SESSION_HEADER_ID } from '@libs/classManagement/constants/pageElementIds';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';

const UserArea = () => {
  const { t } = useTranslation();
  const { user: teacher } = useLmnApiStore();
  const { user } = useUserStore();
  const { member } = useLessonStore();
  const [selectedMember, setSelectedMember] = useState<UserLmnInfo[]>([]);
  const isMemberSelected = selectedMember.length;

  const isTeacherInSameClass = useMemo(
    () =>
      (student: UserLmnInfo): boolean => {
        if (!teacher || !user) return false;
        const teacherClasses = teacher.memberOf.filter((teacherClass) =>
          teacher.schoolclasses.find((userClass) => teacherClass.includes(userClass)),
        );
        return !!teacherClasses.find((tc) => student.memberOf.includes(tc));
      },
    [teacher, user],
  );

  const isTeacherInSameSchool = (student: UserLmnInfo): boolean => {
    if (!teacher || !user) return false;
    return teacher.sophomorixSchoolname === student.sophomorixSchoolname;
  };

  const selectableMembers = member.filter((m) => m.sophomorixRole === SOPHOMORIX_STUDENT && isTeacherInSameSchool(m));

  const getSelectedStudents = () => {
    if (isMemberSelected) {
      return selectedMember.filter((m) => m.sophomorixRole === SOPHOMORIX_STUDENT);
    }
    return selectableMembers;
  };

  const areAllChecked = selectedMember.length === selectableMembers.length;

  const onCheckAll = () => {
    if (!areAllChecked) {
      setSelectedMember(selectableMembers);
    } else setSelectedMember([]);
  };

  const pageBarsHeight =
    useElementHeight([FLOATING_BUTTONS_BAR_ID, LESSON_SESSION_HEADER_ID, FILTER_BAR_ID, FOOTER_ID], isMemberSelected) +
    10;

  return (
    <>
      <div
        className="flex items-center"
        id={LESSON_SESSION_HEADER_ID}
      >
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
          {member.length} {t('classmanagement.usersInThisSession')}{' '}
          {isMemberSelected ? `(${isMemberSelected} ${t('common.selected')})` : null}
        </h3>
      </div>
      <div
        className="flex max-w-full flex-wrap overflow-y-auto overflow-x-visible scrollbar-thin"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        {member.sort(sortByName).map((m) => (
          <UserCard
            key={m.dn}
            user={m}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            isTeacherInSameClass={isTeacherInSameClass(m)}
            isTeacherInSameSchool={isTeacherInSameSchool(m)}
          />
        ))}
      </div>
      <LessonFloatingButtonsBar
        students={getSelectedStudents()}
        isMemberSelected={!!isMemberSelected}
      />
    </>
  );
};

export default UserArea;
