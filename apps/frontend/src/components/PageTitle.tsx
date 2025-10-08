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
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import APPLICATION_NAME from '@libs/common/constants/applicationName';

interface PageTitleProps {
  title?: string;
  translationId: string;
  disableTranslation?: boolean;
}

const PageTitle = ({ title, translationId, disableTranslation }: PageTitleProps) => {
  const { t } = useTranslation();

  return (
    <Helmet>
      <title>
        {title ? `${title} - ` : ''}
        {disableTranslation ? translationId : t(translationId)} - {APPLICATION_NAME}
      </title>
    </Helmet>
  );
};

export default PageTitle;
