import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { MdGroups, MdPrint, MdScience } from 'react-icons/md';
import useUserStore from '@/store/userStore';
import useSchoolManagementStore from '../store/schoolManagementStore';
import { getLastPartOfPath } from '@/pages/SchoolmanagementPage/utilis/utilitys.ts';
import { LDAPUser } from '@/pages/SchoolmanagementPage/store/ldapUser.ts';
import EnrolDialog from '@/pages/SchoolmanagementPage/components/dialogs/EnrolDialog.tsx';

type DialogProperty = {
  label: string;
  value: string | boolean;
};

const EnrolPage: React.FC = () => {
  const {
    groupsData,
    fetchGroupsData,
    fetchAndStoreAllUserProjectsClassesAndPrinters,
    allSchoolProjects,
    allSchoolClasses,
    allSchoolPrinters,
  } = useSchoolManagementStore();
  const { userInfo } = useUserStore();
  const [dataFetched, setDataFetched] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogProperties, setDialogProperties] = useState<DialogProperty[]>([]);
  const [dialogAdmins, setDialogAdmins] = useState<{ name: string; role: string }[]>([]);
  const [dialogMembers, setDialogMembers] = useState<{ name: string; role: string }[]>([]);
  const [dialogDevices, setDialogDevices] = useState<{ name: string; role: string }[]>([]);
  const [showAdmins, setShowAdmins] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showAddUser, setShowAddUser] = useState(true);
  const specificSchoolId = 'SCHOOLS';

  const getUserType = (ldapEntryDN: string) => {
    if (ldapEntryDN.includes('OU=Students')) return 'student';
    if (ldapEntryDN.includes('OU=Teachers')) return 'teacher';
    if (ldapEntryDN.includes('OU=Devices')) return 'devices';
    return '';
  };

  const countUserTypes = (members: LDAPUser[]) => {
    let studentCount = 0;
    let teacherCount = 0;

    members.forEach((member) => {
      const userType = getUserType(member.attributes.LDAP_ENTRY_DN[0]);
      if (userType === 'student') {
        studentCount += 1;
      } else if (userType === 'teacher') {
        teacherCount += 1;
      }
    });

    return { studentCount, teacherCount };
  };

  const categorizeMembers = (members: LDAPUser[]) => {
    const admins: { name: string; role: string }[] = [];
    const users: { name: string; role: string }[] = [];
    const printers: { name: string; role: string }[] = [];

    members.forEach((member) => {
      const userType = getUserType(member.attributes.LDAP_ENTRY_DN[0]);
      const memberInfo = {
        name: `${member.firstName} ${member.lastName}`,
        role: userType,
      };
      const printerInfo = {
        name: `${member.username}`,
        role: userType,
      };

      if (userType === 'teacher') {
        admins.push(memberInfo);
      } else if (userType === 'student') {
        users.push(memberInfo);
      } else if (userType === 'devices') {
        printers.push(printerInfo);
      }
    });

    return { admins, users, printers };
  };

  const openDialog = (type: string, name: string, members: LDAPUser[]) => {
    const { admins, users, printers } = categorizeMembers(members);

    setDialogTitle(name);
    setDialogAdmins(admins);
    setDialogMembers(users);
    setDialogDevices(printers);

    setShowAdmins(type !== 'printer');
    setShowProperties(true);
    setShowMembers(type !== 'printer');
    setShowDevices(type === 'printer');
    setShowAddUser(type === 'project');
    setDialogOpen(true);

    const commonProperties: DialogProperty[] = [
      { label: 'Type', value: type },
      { label: 'Schoolname', value: userInfo.ldapGroups.school },
    ];

    const additionalProperties: Record<string, DialogProperty[]> = {
      project: [
        { label: 'Beitretbar', value: true },
        { label: 'Nicht anzeigen', value: false },
        { label: 'Verteiler', value: true },
      ],
      class: [{ label: 'Verteiler', value: true }],
      printer: [],
    };

    setDialogProperties([...commonProperties, ...(additionalProperties[type] || [])]);
  };

  useEffect(() => {
    if (!dataFetched) {
      fetchGroupsData()
        .then(() => setDataFetched(true))
        .catch((e) => console.error(e));
    }
  }, [dataFetched]);

  useEffect(() => {
    if (dataFetched) {
      const specificSchool = groupsData.schools.find((school) => school.name === specificSchoolId);
      const printers = groupsData.schools.find((school) => school.name.includes(`${userInfo.ldapGroups.school}-r`));

      if (specificSchool && printers) {
        fetchAndStoreAllUserProjectsClassesAndPrinters(
          specificSchool.classes.map((classes) => classes.path),
          specificSchool.projects.map((project) => project.path),
          printers.printers.map((printer) => printer.path),
          userInfo,
        ).catch((e) => console.error(e));
      }
    }
  }, [dataFetched, groupsData, specificSchoolId, userInfo]);

  const userCountCSS = 'flex h-8 w-8 items-center justify-center rounded-sm bg-ciLightGrey text-white';
  const adminCountCSS = 'flex h-8 w-8 items-center justify-center rounded-sm bg-red-500 text-white';

  return (
    <div className="p-4">
      {allSchoolClasses ? (
        <div
          key={userInfo?.ldapGroups?.school}
          className="mb-8"
        >
          <h2 className="mb-2 text-xl font-semibold">
            {t('schoolManagement.availableGroups', { schoolname: userInfo?.ldapGroups?.school })}
          </h2>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">{t('schoolManagement.class')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(allSchoolClasses).map(([className, members]) => (
                <div
                  key={className}
                  className="flex cursor-pointer items-center justify-between rounded border p-2"
                  onClick={() => openDialog('class', getLastPartOfPath(className), members)}
                >
                  <MdGroups className="mr-2 text-gray-600" />
                  <div className="flex w-full justify-between">
                    <p>{getLastPartOfPath(className)}</p>
                    <p className={userCountCSS}>{Object.keys(members).length}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">{t('schoolManagement.printer')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(allSchoolPrinters).map(([printersName, members]) => (
                <div
                  key={printersName}
                  className="flex cursor-pointer items-center justify-between rounded border p-2"
                  onClick={() => openDialog('printer', getLastPartOfPath(printersName), members)}
                >
                  <MdPrint className="mr-2 text-gray-600" />
                  <div className="flex w-full justify-between">
                    <p>{getLastPartOfPath(printersName)}</p>
                    <p className={userCountCSS}>{Object.keys(members).length}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">{t('schoolManagement.projects')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(allSchoolProjects).map(([projectName, members]) => {
                const { studentCount, teacherCount } = countUserTypes(members);
                return (
                  <div
                    key={projectName}
                    className="flex cursor-pointer items-center justify-between rounded border p-2"
                    onClick={() => openDialog('project', getLastPartOfPath(projectName), members)}
                  >
                    <MdScience className="mr-2 text-gray-600" />
                    <div className="flex w-full justify-between">
                      <p>{getLastPartOfPath(projectName)}</p>
                      <div className="flex justify-end gap-x-2">
                        <p className={userCountCSS}>{teacherCount}</p>
                        <p className={adminCountCSS}>{studentCount}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p>{t('schoolManagement.noDataAvailable')}</p>
      )}

      <EnrolDialog
        title={dialogTitle}
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        onOpenChange={setDialogOpen}
        properties={dialogProperties}
        admins={dialogAdmins}
        members={dialogMembers}
        printers={dialogDevices}
        showMemberAdd={showAddUser}
        showPrintersSection={showDevices}
        showAdminsSection={showAdmins}
        showMembersSection={showMembers}
        showPropertiesSection={showProperties}
      />
    </div>
  );
};

export default EnrolPage;
