import React from 'react';
import { Route } from 'react-router-dom';
import { CLASS_MANAGEMENT_PATH } from '@libs/classManagement/constants/classManagementPaths';
import LessonPage from '@/pages/ClassManagement/LessonPage/LessonPage';
import EnrolPage from '@/pages/ClassManagement/EnrolPage/EnrolPage';

const getClassManagementRoutes = () => [
  <Route
    key={CLASS_MANAGEMENT_PATH}
    path={CLASS_MANAGEMENT_PATH}
  >
    <Route
      path=""
      element={<LessonPage />}
    />
    <Route
      path="lesson"
      element={<LessonPage />}
    />
    <Route
      path="lesson/:groupType/:groupName"
      element={<LessonPage />}
    />
    <Route
      path="enrol"
      element={<EnrolPage />}
    />
  </Route>,
];

export default getClassManagementRoutes;
