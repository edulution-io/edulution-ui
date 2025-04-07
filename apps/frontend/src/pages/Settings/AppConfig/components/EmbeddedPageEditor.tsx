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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { html as beautifyHtml } from 'js-beautify';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { Button } from '@/components/shared/Button';
import { Textarea } from '@/components/ui/Textarea';
import { FormControl, FormFieldSH, FormItem } from '@/components/ui/Form';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

import 'react-quill-new/node_modules/quill/dist/quill.snow.css';

interface EmbeddedPageEditorProps {
  name: string;
  form: UseFormReturn<{
    [key: string]: { extendedOptions: { [ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT]: string } };
  }>;
}

const EmbeddedPageEditor: React.FC<EmbeddedPageEditorProps> = ({ name, form }) => {
  const { t } = useTranslation();
  const [openPreview, setOpenPreview] = useState(false);

  const toggleMode = () => {
    setOpenPreview((prev) => !prev);
  };

  const formatCode = () => {
    form.setValue(
      `${name}.extendedOptions.${ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT}`,
      beautifyHtml(
        form.getValues(`${name}.extendedOptions.${ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT}`),

        {
          indent_size: 2,
          preserve_newlines: false,
          wrap_line_length: 200,
        },
      ),
    );
  };

  const htmlContent = form.watch(`${name}.extendedOptions.${ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT}`);

  return (
    <AccordionSH type="multiple">
      <AccordionItem value="embedded">
        <AccordionTrigger className="flex text-h4">
          <h4 className="text-background">{t(`form.embeddedPageEditor`)}</h4>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="btn-collaboration"
                size="lg"
                onClick={toggleMode}
              >
                {t('common.preview')}
              </Button>
              <Button
                type="button"
                variant="btn-infrastructure"
                size="lg"
                onClick={formatCode}
              >
                {t('common.format')}
              </Button>
            </div>

            <FormFieldSH
              key={name}
              control={form.control}
              name={`${name}.extendedOptions.${ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT}`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      value={field.value}
                      onChange={field.onChange}
                      className="h-80 overflow-y-auto bg-accent text-secondary scrollbar-thin placeholder:text-p focus:outline-none"
                      style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12pt' }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {openPreview && (
              <ResizableWindow
                titleTranslationId={t('common.preview')}
                handleClose={() => setOpenPreview(false)}
              >
                <div
                  className="h-screen"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </ResizableWindow>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default EmbeddedPageEditor;
