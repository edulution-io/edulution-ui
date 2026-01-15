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

import React from 'react';
import { useTranslation } from 'react-i18next';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useGroupStore from '@/store/GroupStore';
import useSaveTemplateDialogStore from '@/pages/Surveys/Editor/dialog/useSaveTemplateDialogStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import Input from '@/components/shared/Input';
import Label from '@/components/ui/Label';

const SaveTemplateDialogBody = () => {
  const { t } = useTranslation();

  const { searchGroups } = useGroupStore();

  const { isSubmitting, accessGroups, setAccessGroups, name, setName } = useSaveTemplateDialogStore();

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const filteredCurrentGroups = accessGroups.filter((currentGroup) =>
      newGroups.some((newGroup) => newGroup.value === currentGroup.value),
    );
    const combinedGroups = [
      ...filteredCurrentGroups,
      ...newGroups.filter(
        (newGroup) => !filteredCurrentGroups.some((currentGroup) => currentGroup.value === newGroup.value),
      ),
    ];
    setAccessGroups(combinedGroups);
  };

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center ">
        <CircleLoader />
      </div>
    );
  }

  return (
    <>
      <Label>{t('survey.editor.saveTemplate.templateName')}</Label>
      <Input
        placeholder={t('survey.editor.saveTemplate.addTemplateName')}
        type="text"
        variant="dialog"
        value={name || ''}
        onChange={(e) => setName(e.target.value)}
      />
      <AsyncMultiSelect<MultipleSelectorGroup>
        value={accessGroups || []}
        onSearch={searchGroups}
        onChange={(groups) => handleGroupsChange(groups)}
        placeholder={t('search.type-to-search')}
      />
    </>
  );
};

export default SaveTemplateDialogBody;
