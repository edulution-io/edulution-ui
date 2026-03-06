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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@edulution-io/ui-kit';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import useSubMenuStore from '@/store/useSubMenuStore';

interface MenuBarSearchForm {
  search: string;
}

const MenuBarSearch: React.FC = () => {
  const { t } = useTranslation();
  const setSearchTerm = useSubMenuStore((state) => state.setSearchTerm);

  const form = useForm<MenuBarSearchForm>({
    defaultValues: { search: '' },
  });

  const searchValue = form.watch('search');

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue, setSearchTerm]);

  const handleClear = () => {
    form.setValue('search', '');
  };

  return (
    <div className="relative px-4 py-2">
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="absolute left-6 top-1/2 z-10 h-3 w-3 -translate-y-1/2 text-muted-foreground"
      />
      <Form {...form}>
        <FormField
          form={form}
          name="search"
          placeholder={t('search.type-to-search')}
          className="w-full rounded-md border border-muted bg-transparent py-1.5 pl-7 pr-7 text-sm text-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </Form>
      {searchValue && (
        <Button
          type="button"
          variant="btn-ghost"
          onClick={handleClear}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <FontAwesomeIcon
            icon={faXmark}
            className="h-3 w-3"
          />
        </Button>
      )}
    </div>
  );
};

export default MenuBarSearch;
