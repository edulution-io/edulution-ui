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

import React, { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { parse, stringify } from 'yaml';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';
import YamlEditor from '@/components/shared/YamlEditor';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import type YamlDokument from '@libs/appconfig/types/yamlDokument';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import getDefaultYaml from '@libs/appconfig/utils/getDefaultYaml';
import slugify from '@libs/common/utils/slugify';
import DOCKER_APPLICATION_LIST from '@libs/docker/constants/dockerApplicationList';
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
  const isKnownApp = Object.keys(DOCKER_APPLICATION_LIST).includes(item.name);
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
      const containerName = DOCKER_APPLICATION_LIST[item.name as TApps] || '';

      void getTraefikConfig(item.name as TApps, containerName);
    }
  }, [item.name]);

  const updateYaml = () => {
    try {
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
    } catch (error) {
      console.error('Error parsing YAML:', error);
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
              <div className="flex flex-wrap items-center justify-between gap-10">
                <FormField
                  key={`${item.name}.proxyPath`}
                  name={`${item.name}.proxyPath`}
                  disabled={!expertModeEnabled}
                  form={form}
                  defaultValue=""
                  labelTranslationId={t('form.proxyPath')}
                  placeholder={t('form.proxyPathPlaceholder')}
                  className="min-w-64"
                />
                <FormField
                  key={`${item.name}.proxyDestination`}
                  name={`${item.name}.proxyDestination`}
                  disabled={!expertModeEnabled}
                  form={form}
                  defaultValue=""
                  labelTranslationId={t('form.proxyDestination')}
                  placeholder={t('form.proxyDestinationPlaceholder')}
                  className="min-w-96"
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
                onClick={handleLoadDefaultConfig}
              >
                {t('common.template')}
              </Button>
              <Button
                className="mr-4"
                type="button"
                variant="btn-collaboration"
                size="lg"
                onClick={handleClearProxyConfig}
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
