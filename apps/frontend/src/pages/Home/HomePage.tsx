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

import React, { useEffect } from 'react';
import { DashboardPage } from '@/pages/Dashboard';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const HomePage: React.FC = () => {
  const { bulletinsByCategories, getBulletinsByCategories, isLoading } = useBulletinBoardStore();

  useEffect(() => {
    void getBulletinsByCategories();
  }, []);

  if (isLoading) {
    return <LoadingIndicator isOpen />;
  }

  if (bulletinsByCategories && Object.keys(bulletinsByCategories).length) return <BulletinBoardPage />;

  return <DashboardPage />;
};

export default HomePage;
