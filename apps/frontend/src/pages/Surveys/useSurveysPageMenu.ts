/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { useNavigate } from 'react-router-dom';
import {
  ANSWERED_SURVEYS_PAGE,
  CREATED_SURVEYS_PAGE,
  CREATOR_SURVEYS_PAGE,
  OPEN_SURVEYS_PAGE,
} from '@libs/survey/constants/surveys-endpoint';
import { PlusIcon, SurveysMenuIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, UserIcon } from '@/assets/icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';
import SurveysPageView from '@libs/survey/types/api/page-view';

const useSurveysPageMenu = () => {
  const navigate = useNavigate();

  const menuBar = (): MenuBarEntry => ({
    title: 'surveys.title',
    icon: SurveysMenuIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.SURVEYS,
    menuItems: [
      {
        id: SurveysPageView.OPEN,
        label: 'surveys.view.open.menu',
        icon: SurveysViewOpenIcon,
        action: () => {
          navigate(OPEN_SURVEYS_PAGE);
        },
      },
      {
        id: SurveysPageView.ANSWERED,
        label: 'surveys.view.answered.menu',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          navigate(ANSWERED_SURVEYS_PAGE);
        },
      },
      {
        id: SurveysPageView.CREATED,
        label: 'surveys.view.created.menu',
        icon: UserIcon,
        action: () => {
          navigate(CREATED_SURVEYS_PAGE);
        },
      },
      {
        id: SurveysPageView.CREATOR,
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
