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

import React, { useCallback, useState } from 'react';
import { Control, FieldValues, Path, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { js as beautifyJs } from 'js-beautify';
import { parse } from 'acorn';
import { FormControl, FormFieldSH, FormItem } from '@/components/ui/Form';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/shared/Button';
import cn from '@libs/common/utils/className';

interface ScriptEditorFieldProps<T extends FieldValues> {
  fieldPath: Path<T>;
  enabledFieldPath: Path<T>;
  control: Control<T>;
}

const ScriptEditorField = <T extends FieldValues>({
  fieldPath,
  enabledFieldPath,
  control,
}: ScriptEditorFieldProps<T>) => {
  const { t } = useTranslation();
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEnabled = useWatch({ control, name: enabledFieldPath });
  const scriptContent = useWatch({ control, name: fieldPath });

  const validateScript = useCallback((script: string): boolean => {
    if (!script?.trim()) {
      setValidationError(null);
      return true;
    }
    try {
      parse(script, { ecmaVersion: 'latest' });
      setValidationError(null);
      return true;
    } catch (e) {
      setValidationError((e as Error).message);
      return false;
    }
  }, []);

  const handleValidateClick = () => {
    if (validateScript(scriptContent as string)) {
      toast.success(t('settings.appconfig.sections.scripts.syntaxValid'));
    }
  };

  return (
    <div
      className={cn(
        'transition-[max-height,opacity] duration-300 ease-in-out',
        isEnabled ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      <FormFieldSH
        control={control}
        name={fieldPath}
        render={({ field }) => {
          const handleFormatClick = () => {
            const formatted = beautifyJs((field.value as string) || '', { indent_size: 2 });
            field.onChange(formatted);
            validateScript(formatted);
          };

          return (
            <FormItem>
              <FormControl>
                <Textarea
                  value={(field.value as string) || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    validateScript(e.target.value);
                  }}
                  className="overflow-y-auto bg-white text-background transition-[max-height,opacity] duration-300 ease-in-out scrollbar-thin placeholder:text-p focus:outline-none dark:border-none dark:bg-accent"
                  style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12pt' }}
                  placeholder={t('settings.appconfig.sections.scripts.placeholder')}
                />
              </FormControl>
              {validationError && (
                <p className="mt-2 text-sm text-destructive">
                  {t('settings.appconfig.sections.scripts.syntaxInvalid')}: {validationError}
                </p>
              )}
              <div className="mt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="btn-infrastructure"
                  size="lg"
                  onClick={handleValidateClick}
                  disabled={!(scriptContent as string)?.trim()}
                >
                  {t('common.validate')}
                </Button>
                <Button
                  type="button"
                  variant="btn-collaboration"
                  size="lg"
                  onClick={handleFormatClick}
                  disabled={!(scriptContent as string)?.trim()}
                >
                  {t('common.format')}
                </Button>
              </div>
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default ScriptEditorField;
