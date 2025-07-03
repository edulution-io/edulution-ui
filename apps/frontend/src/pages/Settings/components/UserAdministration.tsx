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
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { useTranslation } from 'react-i18next';
import ResetMfaForm from './ResetMfaForm';

const UserAdministration: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AccordionSH
      type="multiple"
      defaultValue={['reset-mfa']}
    >
      <AccordionItem value="reset-mfa">
        <AccordionTrigger className="flex">
          <h4>{t('settings.userAdministration.resetMfaForm')}</h4>
        </AccordionTrigger>
        <AccordionContent>
          <ResetMfaForm />
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default UserAdministration;
