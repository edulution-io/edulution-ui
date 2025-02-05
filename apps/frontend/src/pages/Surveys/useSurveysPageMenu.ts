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

import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/api/page-view';
import { PlusIcon, SurveysSidebarIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, UserIcon } from '@/assets/icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useSurveysPageMenu = () => {
  const [, setSearchParams] = useSearchParams();

  const menuBar = (): MenuBarEntry => ({
    title: 'surveys.title',
    icon: SurveysSidebarIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.SURVEYS,
    menuItems: [
      {
        id: 'overview-open-surveys',
        label: 'surveys.view.open.menu',
        icon: SurveysViewOpenIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.OPEN });
        },
      },
      {
        id: 'overview-answered-surveys',
        label: 'surveys.view.answered.menu',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.ANSWERED });
        },
      },
      {
        id: 'overview-created-surveys',
        label: 'surveys.view.created.menu',
        icon: UserIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.CREATED });
        },
      },
      {
        id: 'survey-editor-view',
        label: 'surveys.view.editor.menu',
        icon: PlusIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.CREATOR });
        },
      },
    ],
  });
  return menuBar();
};
export default useSurveysPageMenu;
