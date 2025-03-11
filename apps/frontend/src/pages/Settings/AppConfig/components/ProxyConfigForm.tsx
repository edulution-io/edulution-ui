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
import { Trans, useTranslation } from 'react-i18next';
import { parse, stringify } from 'yaml';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';
import YamlEditor from '@/components/shared/YamlEditor';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import type YamlDokument from '@libs/appconfig/types/yamlDokument';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import getDefaultYaml from '@libs/appconfig/utils/getDefaultYaml';
import slugify from '@libs/common/utils/slugify';
import DOCKER_APPLICATIONS from '@libs/docker/constants/dockerApplicationList';
import type TApps from '@libs/appconfig/types/appsType';
import cn from '@libs/common/utils/className';
import useDockerApplicationStore from '../DockerIntegration/useDockerApplicationStore';

type ProxyConfigFormProps = {
  item: AppConfigDto;
  form: UseFormReturn<ProxyConfigFormType>;
};

const ProxyConfigForm: React.FC<ProxyConfigFormProps> = ({ item, form }) => {
  const { t } = useTranslation();
  const [expertModeEnabled, setExpertModeEnabled] = useState(false);
  const { traefikConfig, getTraefikConfig } = useDockerApplicationStore();
  const [isTraefikConfigPredefined, setIsTraefikConfigPredefined] = useState(false);

  const isYamlConfigured = form.watch(`${item.name}.proxyConfig`) !== '';
  const defaultYaml = useMemo(() => getDefaultYaml(item.name), [item.name]);
  const isKnownApp = Object.keys(DOCKER_APPLICATIONS).includes(item.name);
  const isProxyActuallyConfigured = item.options.proxyConfig !== '';

  const proxyPath = slugify(form.getValues(`${item.name}.proxyPath`) || '');
  const proxyDestination = form.getValues(`${item.name}.proxyDestination`);
  const stripPrefix = form.getValues(`${item.name}.stripPrefix`) as boolean;

  useEffect(() => {
    if (traefikConfig && isKnownApp && isProxyActuallyConfigured) {
      setIsTraefikConfigPredefined(true);
    } else {
      setIsTraefikConfigPredefined(false);
    }
  }, [traefikConfig, item.name]);

  useEffect(() => {
    if (isKnownApp) {
      const containerName = DOCKER_APPLICATIONS[item.name as TApps] || '';

      void getTraefikConfig(item.name as TApps, containerName);
    }
  }, [item.name]);

  const updateYaml = () => {
    const jsonData = parse(form.getValues(`${item.name}.proxyConfig`) || defaultYaml) as YamlDokument;
    if (proxyPath) {
      jsonData.http.routers[item.name].rule = `PathPrefix(\`/${proxyPath}\`)`;
      if (stripPrefix) {
        jsonData.http.middlewares['strip-prefix'] = {
          stripPrefix: {
            prefixes: [`/${proxyPath}`],
          },
        };
        jsonData.http.routers[item.name].middlewares = ['strip-prefix'];
      } else {
        delete jsonData.http.middlewares['strip-prefix'];
        jsonData.http.routers[item.name].middlewares = [];
      }
    }

    if (proxyDestination) {
      jsonData.http.services[item.name].loadBalancer.servers[0].url = proxyDestination;
    }
    const updatedYaml = stringify(jsonData);
    if (updatedYaml !== form.getValues(`${item.name}.proxyConfig`)) {
      form.setValue(`${item.name}.proxyConfig`, updatedYaml);
    }
  };

  useEffect(() => {
    if (expertModeEnabled && !isTraefikConfigPredefined) {
      updateYaml();
    }
  }, [isTraefikConfigPredefined, proxyPath, proxyDestination, stripPrefix]);

  const handleClearProxyConfig = () => {
    form.setValue(`${item.name}.proxyConfig`, '');
  };

  const handleLoadDefaultConfig = () => {
    if (isTraefikConfigPredefined) {
      form.setValue(`${item.name}.proxyConfig`, stringify(traefikConfig));
    } else {
      form.setValue(`${item.name}.proxyConfig`, defaultYaml);
    }
  };

  useEffect(() => {
    if ((expertModeEnabled && proxyPath === '') || proxyPath == null) {
      handleLoadDefaultConfig();
    }
  }, [proxyPath]);

  return (
    <AccordionSH type="multiple">
      <AccordionItem value={item.name}>
        <AccordionTrigger className="flex text-h4">
          <h4 className="text-background">{t(`form.proxyConfig`)}</h4>
        </AccordionTrigger>
        <AccordionContent>
          <p>
            <Trans
              i18nKey="form.proxyConfigDescription"
              components={{
                strong: <strong />,
                br: <br />,
              }}
            />
          </p>

          <div className="mt-4 flex items-center space-x-2">
            <Switch
              checked={expertModeEnabled}
              onCheckedChange={setExpertModeEnabled}
            />
            <p className="text-background">{t('form.expertMode')}</p>
          </div>

          <div className="space-y-4 px-1 pt-4">
            <div
              className={cn(
                'flex-row items-center justify-between gap-2',
                !expertModeEnabled || isKnownApp ? 'hidden' : 'flex',
              )}
            >
              <div className="flex flex-row items-center justify-between gap-10">
                <FormFieldSH
                  key={`${item.name}.proxyPath`}
                  control={form.control}
                  name={`${item.name}.proxyPath`}
                  defaultValue=""
                  disabled={!expertModeEnabled}
                  render={({ field }) => (
                    <FormItem>
                      <p className="font-bold text-background">{t(`form.proxyPath`)}</p>
                      <FormControl>
                        <Input
                          {...field}
                          className="min-w-32"
                          placeholder={t('form.proxyPathPlaceholder')}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-p" />
                    </FormItem>
                  )}
                />
                <FormFieldSH
                  key={`${item.name}.proxyDestination`}
                  control={form.control}
                  name={`${item.name}.proxyDestination`}
                  defaultValue=""
                  disabled={!expertModeEnabled}
                  render={({ field }) => (
                    <FormItem>
                      <p className="font-bold text-background">{t(`form.proxyDestination`)}</p>
                      <FormControl>
                        <Input
                          {...field}
                          className="min-w-64"
                          placeholder={t('form.proxyDestinationPlaceholder')}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-p" />
                    </FormItem>
                  )}
                />
                <FormFieldSH
                  key={`${item.name}.stripPrefix`}
                  control={form.control}
                  name={`${item.name}.stripPrefix`}
                  defaultValue={false}
                  disabled={!expertModeEnabled}
                  render={({ field }) => (
                    <FormItem>
                      <p className="font-bold text-background">{t('form.stripPrefix')}</p>
                      <FormControl>
                        <Switch
                          {...field}
                          checked={field.value as boolean}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-p" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormFieldSH
              key={`${item.name}.proxyConfig`}
              control={form.control}
              name={`${item.name}.proxyConfig`}
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold text-background">{t(`form.proxyConfig`)}</p>
                  <FormControl>
                    <YamlEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!expertModeEnabled}
                    />
                  </FormControl>
                  <FormMessage className="text-p" />
                </FormItem>
              )}
            />
            <div className="flex flex-row justify-end">
              <Button
                className="mr-4"
                type="button"
                variant="btn-infrastructure"
                size="lg"
                onClickCapture={handleLoadDefaultConfig}
              >
                {t('common.template')}
              </Button>
              <Button
                className="mr-4"
                type="button"
                variant="btn-collaboration"
                size="lg"
                onClickCapture={handleClearProxyConfig}
                disabled={!isYamlConfigured}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default ProxyConfigForm;
