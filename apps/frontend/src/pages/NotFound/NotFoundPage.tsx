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

import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="mt-3 text-center">
    <h1 className="mb-1 text-lg">404 - Page Not Found</h1>
    <p className="text-md mb-1">Oops! The page you are looking for does not exist.</p>
    <Link to={ROOT_ROUTE}>Go back to home</Link>
  </div>
);

export default NotFoundPage;
