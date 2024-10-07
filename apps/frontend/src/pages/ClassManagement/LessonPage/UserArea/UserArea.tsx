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

  return (
    <div className="mt-3 h-full ">
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
          <p className="ml-2">{t('selectAll')}</p>
        </div>

        <h3 className="mb-2 flex flex-grow justify-center text-center">
          {member.length} {t('classmanagement.usersInThisSession')}{' '}
          {isMemberSelected ? `(${isMemberSelected} ${t('common.selected')})` : null}
        </h3>
      </div>
      <div className="flex max-h-[calc(100vh-390px)] max-w-full flex-wrap overflow-y-auto overflow-x-visible scrollbar-thin md:max-h-[calc(100vh-240px)]">
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
      {isMemberSelected ? <LessonFloatingButtonsBar students={getSelectedStudents()} /> : null}
    </div>
  );
};

export default UserArea;
