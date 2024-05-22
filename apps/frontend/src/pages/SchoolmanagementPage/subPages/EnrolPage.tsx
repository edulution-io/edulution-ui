import React, { useEffect } from 'react';
import { t } from 'i18next';
import { MdGroups, MdPrint, MdScience } from 'react-icons/md';
import useUserStore from '@/store/userStore';
import useSchoolManagementStore from '../store/schoolManagementStore';

const EnrolPage: React.FC = () => {
  const { groupsData, fetchGroupsData } = useSchoolManagementStore();
  const { userInfo } = useUserStore();

  const specificSchoolId = 'SCHOOLS';

  useEffect(() => {
    fetchGroupsData().catch((e) => console.error(e));
  }, [fetchGroupsData]);

  const specificSchool = groupsData.schools.find((school) => school.name === specificSchoolId);
  const printers = groupsData.schools.find((school) => school.name.includes('agy-r'));
  return (
    <div className=" p-4">
      {specificSchool ? (
        <div
          key={userInfo.ldapGroups.school}
          className="mb-8"
        >
          <h2 className="mb-2 text-xl font-semibold">
            {t('schoolManagement.availableGroups', { schoolname: userInfo.ldapGroups.school })}
          </h2>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">{t('schoolManagement.class')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {specificSchool.classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div className="flex items-center">
                    <MdGroups className="mr-2 text-gray-600" />
                    <span>{classItem.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">{t('schoolManagement.printer')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {printers?.printers.map((printer) => (
                <div
                  key={printer.id}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div className="flex items-center">
                    <MdPrint className="mr-2 text-gray-600" />
                    <span>{printer.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">{t('schoolManagement.projects')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {specificSchool.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div className="flex items-center">
                    <MdScience className="mr-2 text-gray-600" />
                    <span>{project.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p>{t('schoolManagement.noDataAvailable')}</p>
      )}
    </div>
  );
};

export default EnrolPage;
