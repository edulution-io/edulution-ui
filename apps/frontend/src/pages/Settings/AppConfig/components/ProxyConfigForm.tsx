import React, { useEffect, useMemo, useState } from 'react';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';
import YamlEditor from '@/components/shared/YamlEditor';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import Input from '@/components/shared/Input';
import { parse, stringify } from 'yaml';
import YamlDokument from '@libs/appconfig/types/yamlDokument';
import { Button } from '@/components/shared/Button';
import { AppConfigForm, AppConfigField } from '@libs/appconfig/types';
import getDefaultYaml from '@libs/appconfig/utils/getDefaultYaml';

type ProxyConfigFormProps = {
  settingLocation: string;
  item: AppConfigField;
  form: UseFormReturn<AppConfigForm>;
};

const ProxyConfigForm: React.FC<ProxyConfigFormProps> = ({ settingLocation, item, form }) => {
  const { t } = useTranslation();
  const [expertModeEnabled, setExpertModeEnabled] = useState(false);
  const isYamlConfigured = form.watch(`${item.name}.proxyConfig`) !== '';

  const defaultYaml = useMemo(() => getDefaultYaml(settingLocation), [settingLocation]);

  const updateYaml = () => {
    const proxyPath = form.getValues(`${item.name}.proxyPath`);
    const proxyDestination = form.getValues(`${item.name}.proxyDestination`);
    const stripPrefix = form.getValues(`${item.name}.stripPrefix`) as boolean;

    const jsonData = parse(form.getValues(`${item.name}.proxyConfig`) || defaultYaml) as YamlDokument;
    if (proxyPath) {
      jsonData.http.routers[settingLocation].rule = `PathPrefix(\`/${proxyPath}\`)`;
      if (stripPrefix) {
        jsonData.http.middlewares['strip-prefix'] = {
          stripPrefix: {
            prefixes: [`/${proxyPath}`],
          },
        };
        jsonData.http.routers[settingLocation].middlewares = ['strip-prefix'];
      } else {
        delete jsonData.http.middlewares['strip-prefix'];
        jsonData.http.routers[settingLocation].middlewares = [];
      }
    }

    if (proxyDestination) {
      jsonData.http.services[settingLocation].loadBalancer.servers[0].url = proxyDestination;
    }

    const updatedYaml = stringify(jsonData);
    form.setValue(`${item.name}.proxyConfig`, updatedYaml);
  };

  useEffect(() => {
    if (!expertModeEnabled) {
      updateYaml();
    }
  }, [
    form.watch(`${item.name}.proxyPath`),
    form.watch(`${item.name}.proxyDestination`),
    form.watch(`${item.name}.stripPrefix`),
  ]);

  const handleClearProxyConfig = () => {
    form.setValue(`${item.name}.proxyConfig`, '');
  };

  return (
    <AccordionSH type="multiple">
      <AccordionItem value={item.name}>
        <AccordionTrigger className="flex text-h4">
          <h4>{t(`form.proxyConfig`)}</h4>
        </AccordionTrigger>
        <AccordionContent className="space-y-10 px-1 pt-4">
          <div className="flex flex-row items-center space-x-6">
            <FormFieldSH
              key={`${item.name}.proxyPath`}
              control={form.control}
              name={`${item.name}.proxyPath`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold">{t(`form.proxyPath`)}</p>
                  <FormControl>
                    <Input
                      {...field}
                      variant="lightGray"
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
              key={`${item.name}.proxyDestination`}
              control={form.control}
              name={`${item.name}.proxyDestination`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold">{t(`form.proxyDestination`)}</p>
                  <FormControl>
                    <Input
                      {...field}
                      variant="lightGray"
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
              key={`${item.name}.stripPrefix`}
              control={form.control}
              name={`${item.name}.stripPrefix`}
              defaultValue={false}
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold">{t('form.stripPrefix')}</p>
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
            <p>{t('form.expertMode')}</p>
          </div>

          <FormFieldSH
            key={`${item.name}.proxyConfig`}
            control={form.control}
            name={`${item.name}.proxyConfig`}
            defaultValue={defaultYaml}
            render={({ field }) => (
              <FormItem>
                <p className="font-bold">{t(`form.proxyConfig`)}</p>
                <FormControl>
                  <YamlEditor
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    disabled={!expertModeEnabled}
                  />
                </FormControl>
                <p>{t(`form.proxyConfigDescription`)}</p>
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
