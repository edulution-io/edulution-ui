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
import { useTranslation } from 'react-i18next';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import PUBLIC_SHARE_SCOPE_FORM_VALUES from '@libs/filesharing/constants/publicShareScopeValues';
import { UseFormReturn } from 'react-hook-form';
import CreateOrEditPublicFileShareDto from '@libs/filesharing/types/createOrEditPublicFileShareDto';

interface ShareLinkScopeSelectorProps {
  form: UseFormReturn<CreateOrEditPublicFileShareDto>;
}

const ShareScopeSelector: React.FC<ShareLinkScopeSelectorProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <RadioGroupFormField
      control={form.control}
      name="scope"
      labelClassname="text-base font-bold text-background"
      titleTranslationId={t('conferences.isPublic')}
      items={PUBLIC_SHARE_SCOPE_FORM_VALUES}
      imageWidth="small"
    />
  );
};

export default ShareScopeSelector;
