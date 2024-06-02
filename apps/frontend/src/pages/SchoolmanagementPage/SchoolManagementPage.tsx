import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PasswordsPage from '@/pages/SchoolmanagementPage/subPages/PasswordsPage';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore.ts';
import useUserStore from '@/store/userStore.ts';
import EnrolPage from './subPages/EnrolPage';
import LessonPage from './subPages/LessonPage';
import ProjectPage from '@/pages/SchoolmanagementPage/subPages/ProjectPage.tsx';

const SchoolManagementPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { fetchAndStoreUserProjectsAndClasses } = useSchoolManagementStore();
  const { userInfo } = useUserStore();
  const page = searchParams.get('page');

  useEffect(() => {
    fetchAndStoreUserProjectsAndClasses(
      userInfo.ldapGroups.classPaths,
      userInfo.ldapGroups.projectPaths,
      userInfo,
    ).catch(console.error);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'enrol':
        return <EnrolPage />;
      case 'lesson':
        return <LessonPage />;
      case 'passwords':
        return <PasswordsPage />;
      case 'project':
        return <ProjectPage />;
      default:
        return (
          <div className="flex flex-col justify-between">
            <p>{page}</p>
            <h2>{t('schoolManagement.title')}</h2>
            <div className="pt-5 sm:pt-0">
              <p className="pb-4">{t('schoolManagement.description')}</p>
            </div>
          </div>
        );
    }
  };

  return renderPage();
};

export default SchoolManagementPage;
