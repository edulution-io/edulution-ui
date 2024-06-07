import React from 'react';
import { FaWifi } from 'react-icons/fa';
import { MemberInfo } from '@/datatypes/schoolclassInfo.ts';
import useSchoolManagementComponentStore from '@/pages/SchoolmanagementPage/store/schoolManagementComponentStore.ts';
import { AiOutlineGlobal } from 'react-icons/ai';
import { FiPrinter } from 'react-icons/fi';

const StudentsPermissionBar = ({ memberId }: { memberId: string }) => {
  const { getPermissionForUser, setPermissionsForUser } = useSchoolManagementComponentStore();
  const member = getPermissionForUser(memberId);

  if (!member) return null;

  const handleButtonClick = (attribute: keyof MemberInfo) => {
    setPermissionsForUser(memberId, { [attribute]: !member[attribute] });
  };

  return (
    <div className="mt-4 flex justify-around">
      <div className="flex cursor-pointer flex-col items-center">
        <FaWifi
          className={member.isWifiOn ? 'text-green-500' : 'text-red-500'}
          onClick={(e) => {
            e.preventDefault();
            handleButtonClick('isWifiOn');
          }}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <AiOutlineGlobal
          className={member.isInternetOn ? 'text-green-500' : 'text-red-500'}
          onClick={(e) => {
            e.preventDefault();
            handleButtonClick('isInternetOn');
          }}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <FiPrinter
          className={member.printerAccess ? 'text-green-500' : 'text-red-500'}
          onClick={(e) => {
            e.preventDefault();
            handleButtonClick('printerAccess');
          }}
        />
      </div>
    </div>
  );
};

export default StudentsPermissionBar;
