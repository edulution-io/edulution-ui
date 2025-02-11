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

import React, { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { parse, stringify } from 'yaml';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';
import YamlEditor from '@/components/shared/YamlEditor';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { type AppConfigOption } from '@libs/appconfig/types';
import type YamlDokument from '@libs/appconfig/types/yamlDokument';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import getDefaultYaml from '@libs/appconfig/utils/getDefaultYaml';

type ProxyConfigFormProps = {
  item: AppConfigOption;
  form: UseFormReturn<ProxyConfigFormType>;
};

const ProxyConfigForm: React.FC<ProxyConfigFormProps> = ({ item, form }) => {
  const { t } = useTranslation();
  const [expertModeEnabled, setExpertModeEnabled] = useState(false);
  const isYamlConfigured = form.watch(`${item.id}.proxyConfig`) !== '';

  const defaultYaml = useMemo(() => getDefaultYaml(item.id), [item.id]);

  const updateYaml = () => {
    const proxyPath = form.getValues(`${item.id}.proxyPath`);
    const proxyDestination = form.getValues(`${item.id}.proxyDestination`);
    const stripPrefix = form.getValues(`${item.id}.stripPrefix`) as boolean;

    const jsonData = parse(form.getValues(`${item.id}.proxyConfig`) || defaultYaml) as YamlDokument;
    if (proxyPath) {
      jsonData.http.routers[item.id].rule = `PathPrefix(\`/${proxyPath}\`)`;
      if (stripPrefix) {
        jsonData.http.middlewares['strip-prefix'] = {
          stripPrefix: {
            prefixes: [`/${proxyPath}`],
          },
        };
        jsonData.http.routers[item.id].middlewares = ['strip-prefix'];
      } else {
        delete jsonData.http.middlewares['strip-prefix'];
        jsonData.http.routers[item.id].middlewares = [];
      }
    }

    if (proxyDestination) {
      jsonData.http.services[item.id].loadBalancer.servers[0].url = proxyDestination;
    }

    const updatedYaml = stringify(jsonData);
    form.setValue(`${item.id}.proxyConfig`, updatedYaml);
  };

  useEffect(() => {
    if (!expertModeEnabled && form.watch(`${item.id}.proxyPath`) !== '') {
      updateYaml();
    }
  }, [
    form.watch(`${item.id}.proxyPath`),
    form.watch(`${item.id}.proxyDestination`),
    form.watch(`${item.id}.stripPrefix`),
  ]);

  const handleClearProxyConfig = () => {
    form.setValue(`${item.id}.proxyConfig`, '');
  };

  return (
    <AccordionSH type="multiple">
      <AccordionItem value={item.id}>
        <AccordionTrigger className="flex text-h4">
          <h4 className="text-background">{t(`form.proxyConfig`)}</h4>
        </AccordionTrigger>
        <AccordionContent className="space-y-10 px-1 pt-4">
          <div className="flex flex-row items-center space-x-6">
            <FormFieldSH
              key={`${item.id}.proxyPath`}
              control={form.control}
              name={`${item.id}.proxyPath`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold text-background">{t(`form.proxyPath`)}</p>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        updateYaml();
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-p" />
                </FormItem>
              )}
            />
            <FormFieldSH
              key={`${item.id}.proxyDestination`}
              control={form.control}
              name={`${item.id}.proxyDestination`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold text-background">{t(`form.proxyDestination`)}</p>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        updateYaml();
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-p" />
                </FormItem>
              )}
            />
            <FormFieldSH
              key={`${item.id}.stripPrefix`}
              control={form.control}
              name={`${item.id}.stripPrefix`}
              defaultValue={false}
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold text-background">{t('form.stripPrefix')}</p>
                  <FormControl>
                    <Switch
                      {...field}
                      checked={field.value as boolean}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        updateYaml();
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-p" />
                </FormItem>
              )}
            />
            {isYamlConfigured && (
              <Button
                type="button"
                variant="btn-collaboration"
                size="lg"
                onClickCapture={handleClearProxyConfig}
              >
                {t('common.delete')}
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={expertModeEnabled}
              onCheckedChange={setExpertModeEnabled}
            />
            <p className="text-background">{t('form.expertMode')}</p>
          </div>

          <FormFieldSH
            key={`${item.id}.proxyConfig`}
            control={form.control}
            name={`${item.id}.proxyConfig`}
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <p className="font-bold text-background">{t(`form.proxyConfig`)}</p>
                <FormControl>
                  <YamlEditor
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    disabled={!expertModeEnabled}
                  />
                </FormControl>
                <p className="text-background">{t(`form.proxyConfigDescription`)}</p>
                <FormMessage className="text-p" />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default ProxyConfigForm;
