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
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { Input } from '@edulution-io/ui-kit';
import Label from '@/components/ui/Label';

const TemplateSaveDialogFields = () => {
  const { templateName, setTemplateName, accessGroups, setAccessGroups } = useSurveyTemplateStore();

  const { searchGroups } = useGroupStore();

  const { t } = useTranslation();

  return (
    <>
      <div>
        <Label>{t('survey.editor.template.save.name.label')}</Label>
        <p className="text-sm text-muted-foreground">{t('survey.editor.template.save.name.description')}</p>
        <Input
          placeholder={t('survey.editor.template.save.name.placeholder')}
          type="text"
          variant="dialog"
          value={templateName || ''}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>
      <div>
        <Label>{t('survey.editor.template.save.accessGroups.label')}</Label>
        <p className="text-sm text-muted-foreground">{t('survey.editor.template.save.accessGroups.description')}</p>
        <AsyncMultiSelect<MultipleSelectorGroup>
          value={accessGroups}
          onSearch={searchGroups}
          onChange={(groups) => setAccessGroups(groups)}
          placeholder={t('search.type-to-search')}
          variant="dialog"
        />
      </div>
    </>
  );
};

export default TemplateSaveDialogFields;
