import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  CLASS_MANAGEMENT_ENROL_LOCATION,
  CLASS_MANAGEMENT_LESSON_LOCATION,
  CLASS_MANAGEMENT_PATH,
  CLASS_MANAGEMENT_PRINT_PASSWORDS_LOCATION,
  CLASS_MANAGEMENT_PROJECTS_LOCATION,
} from '@libs/classManagement/constants/classManagementPaths';
import LessonPage from '@/pages/ClassManagement/LessonPage/LessonPage';
import EnrolPage from '@/pages/ClassManagement/EnrolPage/EnrolPage';
import PrintPasswordsPage from '@/pages/ClassManagement/PasswordsPage/PrintPasswordsPage';
import ProjectsPage from '@/pages/ClassManagement/ProjectsPage/ProjectsPage';

const getClassManagementRoutes = () => [
  <Route
    key={CLASS_MANAGEMENT_PATH}
    path={CLASS_MANAGEMENT_PATH}
  >
    <Route
      path=""
      element={<Navigate to={CLASS_MANAGEMENT_LESSON_LOCATION} />}
    />
    <Route
      path={CLASS_MANAGEMENT_LESSON_LOCATION}
      element={<LessonPage />}
    />
    <Route
      path={`${CLASS_MANAGEMENT_LESSON_LOCATION}/:groupType/:groupName`}
      element={<LessonPage />}
    />
    <Route
      path={CLASS_MANAGEMENT_ENROL_LOCATION}
      element={<EnrolPage />}
    />
    <Route
      path={CLASS_MANAGEMENT_PRINT_PASSWORDS_LOCATION}
      element={<PrintPasswordsPage />}
    />
    <Route
      path={CLASS_MANAGEMENT_PROJECTS_LOCATION}
      element={<ProjectsPage />}
    />
  </Route>,
];

export default getClassManagementRoutes;
