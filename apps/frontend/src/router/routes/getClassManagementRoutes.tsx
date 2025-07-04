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
      element={
        <Navigate
          to={CLASS_MANAGEMENT_LESSON_LOCATION}
          replace
        />
      }
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
