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

const UserArea = () => {
  const { t } = useTranslation();
  const { user: teacher } = useLmnApiStore();
  const { user } = useUserStore();
  const { member } = useLessonStore();
  const [selectedMember, setSelectedMember] = useState<UserLmnInfo[]>([]);

  const isTeacherInSameClass = useMemo(
    () =>
      (student: UserLmnInfo): boolean => {
        if (!teacher || !user) return false;
        const teacherClasses = teacher.memberOf.filter((teacherClass) =>
          user.ldapGroups.classes.find((userClass) => teacherClass.includes(userClass)),
        );
        return !!teacherClasses.find((tc) => student.memberOf.includes(tc));
      },
    [teacher, user],
  );

  const isTeacherInSameSchool = (student: UserLmnInfo): boolean => {
    if (!teacher || !user) return false;
    return teacher.sophomorixSchoolname === student.sophomorixSchoolname;
  };

  const getSelectedStudents = () => {
    if (selectedMember.length) {
      return selectedMember.filter((m) => m.sophomorixRole === SOPHOMORIX_STUDENT);
    }
    return member.filter((m) => m.sophomorixRole === SOPHOMORIX_STUDENT && isTeacherInSameSchool(m));
  };

  return (
    <div className="mt-3 h-full">
      <h3 className="mb-2 text-center">
        {member.length} {t('classmanagement.usersInThisSession')}
        {selectedMember.length ? (
          <div className="ml-4 text-lg md:inline">
            ({selectedMember.length} {t('common.selected')})
          </div>
        ) : null}
      </h3>
      <div className="flex max-h-[calc(100vh-390px)] max-w-full flex-wrap overflow-y-auto md:max-h-[calc(100vh-240px)]">
        {member.sort(sortByName).map((m) => (
          <UserCard
            key={m.dn}
            user={m}
            setSelectedMember={setSelectedMember}
            isTeacherInSameClass={isTeacherInSameClass(m)}
            isTeacherInSameSchool={isTeacherInSameSchool(m)}
          />
        ))}
      </div>
      <LessonFloatingButtonsBar students={getSelectedStudents()} />
    </div>
  );
};

export default UserArea;
