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

import React, { lazy, Suspense, useEffect } from 'react';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PageLayout from '@/components/structure/layout/PageLayout';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';

const TLDrawWithSync = lazy(() => import('./TLDrawWithSync'));
const TlDrawOffline = lazy(() => import('./TLDrawOffline'));

const Whiteboard = () => {
  const { getIsEduApiHealthy, isEduApiHealthy } = useEduApiStore();

  useEffect(() => {
    void getIsEduApiHealthy();
  }, []);

  const loader = <CircleLoader className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />;

  const getPageContent = () => {
    if (isEduApiHealthy === undefined) return loader;
    if (isEduApiHealthy) return <TLDrawWithSync />;
    return <TlDrawOffline />;
  };

  return (
    <PageLayout isFullScreen>
      <Suspense fallback={loader}>
        <div className="z-0 h-full w-full">{getPageContent()}</div>
      </Suspense>
    </PageLayout>
  );
};

export default Whiteboard;
