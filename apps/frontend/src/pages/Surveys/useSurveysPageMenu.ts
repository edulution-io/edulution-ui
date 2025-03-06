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

import { useNavigate } from 'react-router-dom';
import {
  ANSWERED_SURVEYS_PAGE,
  CREATED_SURVEYS_PAGE,
  CREATOR_SURVEYS_PAGE,
  OPEN_SURVEYS_PAGE,
} from '@libs/survey/constants/surveys-endpoint';
import { UserIcon, PlusIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, SurveysSidebarIcon } from '@/assets/icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useSurveysPageMenu = () => {
  const navigate = useNavigate();

  const menuBar = (): MenuBarEntry => ({
    title: 'surveys.title',
    icon: SurveysSidebarIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.SURVEYS,
    menuItems: [
      {
        id: 'open',
        label: 'surveys.view.open.menu',
        icon: SurveysViewOpenIcon,
        action: () => {
          navigate(OPEN_SURVEYS_PAGE);
        },
      },
      {
        id: 'answered',
        label: 'surveys.view.answered.menu',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          navigate(ANSWERED_SURVEYS_PAGE);
        },
      },
      {
        id: 'created',
        label: 'surveys.view.created.menu',
        icon: UserIcon,
        action: () => {
          navigate(CREATED_SURVEYS_PAGE);
        },
      },
      {
        id: 'creator',
        label: 'surveys.view.editor.menu',
        icon: PlusIcon,
        action: () => {
          navigate(CREATOR_SURVEYS_PAGE);
        },
      },
    ],
  });
  return menuBar();
};
export default useSurveysPageMenu;
