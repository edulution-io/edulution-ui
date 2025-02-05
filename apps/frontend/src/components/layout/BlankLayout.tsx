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

import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Sidebar } from '@/components';

const BlankLayout: React.FC<PropsWithChildren> = () => {
  const auth = useAuth();
  const { pathname } = useLocation();
  const isHeaderVisible = pathname !== '/' && pathname !== '/login';

  return (
    <div className="flex">
      <div className="flex h-[100vh] w-full flex-col">
        {isHeaderVisible && <Header hideHeadingText />}

        <main className="flex-1 overflow-hidden p-4 md:w-[calc(100%-var(--sidebar-width))] md:pl-4">
          <Outlet />
        </main>
      </div>
      {auth.isAuthenticated ? <Sidebar /> : null}
      <Footer />
    </div>
  );
};

export default BlankLayout;
