import React from 'react';
import { FaWifi } from 'react-icons/fa';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { useTranslation } from 'react-i18next';
import { FiPrinter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { MdSchool } from 'react-icons/md';
import { FaArrowRightToBracket, FaEarthAmericas } from 'react-icons/fa6';
import { TbFilterCode } from 'react-icons/tb';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import cn from '@/lib/utils';
import { PiEyeFill, PiKey } from 'react-icons/pi';
import { useParams } from 'react-router-dom';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/UserStore';

interface UserCardButtonBarProps {
  user: UserLmnInfo;
  isTeacherInSameClass: boolean;
}

interface UserCardButton {
  icon: IconType;
  value: boolean | null;
  title: UserCardButtons;
  defaultColor?: string;
}

enum UserCardButtons {
  WebFilter = 'webfilter',
  Internet = 'internet',
  Printing = 'printing',
  ExamMode = 'examMode',
  Wifi = 'wifi',
  Veyon = 'veyon',
  PasswordOptions = 'passwordOptions',
  joinClass = 'joinClass',
}

const UserCardButtonBar = ({ user, isTeacherInSameClass }: UserCardButtonBarProps) => {
  const { t } = useTranslation();
  const { fetchUserAndUpdateInDatabase } = useUserStore();
  const { fetchUser } = useLmnApiStore();
  const {
    addManagementGroup,
    removeManagementGroup,
    startExamMode,
    stopExamMode,
    member,
    setMember,
    toggleSchoolClassJoined,
  } = useLessonStore();
  const { internet, printing, examMode, webfilter, wifi, cn: commonName } = user;
  const { groupType, groupName } = useParams();

  const onButtonClick = async (event: React.MouseEvent<HTMLElement>, button: UserCardButton) => {
    event.stopPropagation();

    const users = [user.cn];

    if (button.title === UserCardButtons.Veyon || button.title === UserCardButtons.PasswordOptions) {
      // eslint-disable-next-line no-alert
      alert(t('classmanagement.featureIsStillInDevelopment')); // Will be implemented in NIEDUUI-359
    } else if (button.title === UserCardButtons.ExamMode) {
      if (button.value) {
        await stopExamMode(users, groupType, groupName);
      } else {
        await startExamMode(users);
      }
    } else if (button.title === UserCardButtons.joinClass) {
      await toggleSchoolClassJoined(false, user.sophomorixAdminClass);
      await fetchUserAndUpdateInDatabase();
    } else if (button.value) {
      await removeManagementGroup(button.title, users);
    } else {
      await addManagementGroup(button.title, users);
    }

    const updatedUser = await fetchUser(commonName);
    if (!updatedUser) return;
    setMember([...member.filter((m) => m.cn !== commonName), updatedUser]);
  };

  const booleanButtons: UserCardButton[] = [
    {
      icon: FaWifi,
      value: wifi,
      title: UserCardButtons.Wifi,
    },
    { icon: TbFilterCode, value: webfilter, title: UserCardButtons.WebFilter },
    { icon: FaEarthAmericas, value: internet, title: UserCardButtons.Internet },
    { icon: FiPrinter, value: printing, title: UserCardButtons.Printing },
    { icon: MdSchool, value: examMode, title: UserCardButtons.ExamMode },
    { icon: PiEyeFill, value: null, title: UserCardButtons.Veyon, defaultColor: 'bg-gray-600' },
    { icon: PiKey, value: null, title: UserCardButtons.PasswordOptions, defaultColor: 'bg-gray-600' },
  ];

  const getButtonDescription = (isEnabled: boolean | null) => {
    if (isEnabled === null) {
      return '';
    }
    return isEnabled ? 'classmanagement.disable' : 'classmanagement.enable';
  };

  if (!isTeacherInSameClass) {
    booleanButtons.push({
      icon: FaArrowRightToBracket,
      value: null,
      title: UserCardButtons.joinClass,
      defaultColor: 'bg-ciRed',
    });
  }

  return booleanButtons.map((button) => (
    <div
      key={button.title}
      className="group relative"
    >
      <button
        type="button"
        className={cn(
          'relative z-10 rounded-full p-1.5',
          'group-hover:bg-ciDarkGrey group-hover:text-foreground',
          button.defaultColor || (button.value ? 'bg-ciGreen text-foreground' : 'bg-ciRed'),
        )}
        title={t(button.title)}
        onClick={(e) => onButtonClick(e, button)}
      >
        <button.icon className="text-lg" />
        <div className="absolute right-0 top-0 hidden h-full items-center justify-center whitespace-nowrap rounded-xl bg-ciDarkGrey px-3 text-background group-hover:flex">
          {t(`classmanagement.${button.title}`)} {t(getButtonDescription(button.value))}
        </div>
      </button>
    </div>
  ));
};

export default UserCardButtonBar;
