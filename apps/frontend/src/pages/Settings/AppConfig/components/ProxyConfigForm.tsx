import React, { useEffect, useState } from 'react';
import { AppConfigOption } from '@libs/appconfig/types';
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
import AppConfigForm from '@libs/appconfig/types/appConfigForm';

type ProxyConfigFormProps = {
  settingLocation: string;
  item: AppConfigOption;
  form: UseFormReturn<AppConfigForm>;
};

const ProxyConfigForm: React.FC<ProxyConfigFormProps> = ({ settingLocation, item, form }) => {
  const { t } = useTranslation();
  const [expertModeEnabled, setExpertModeEnabled] = useState(false);
  const isYamlConfigured = form.watch(`${item.id}.proxyConfig`) !== '';

  const defaultYaml = stringify({
    http: {
      routers: {
        [settingLocation]: {
          rule: `PathPrefix(\`/${settingLocation}\`)`,
          service: settingLocation,
          tls: {},
          middlewares: ['strip-prefix'],
        },
      },
      middlewares: {
        'strip-prefix': {
          stripPrefix: {
            prefixes: ['/api'],
          },
        },
      },
      services: {
        [settingLocation]: {
          loadBalancer: {
            servers: [{ url: '' }],
          },
        },
      },
    },
  });

  const updateYaml = () => {
    const proxyPath = form.getValues(`${item.id}.proxyPath`);
    const proxyDestination = form.getValues(`${item.id}.proxyDestination`);
    const stripPrefix = form.getValues(`${item.id}.stripPrefix`) as boolean;

    const jsonData = parse(form.getValues(`${item.id}.proxyConfig`) || defaultYaml) as YamlDokument;
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
    form.setValue(`${item.id}.proxyConfig`, updatedYaml);
  };

  useEffect(() => {
    if (!expertModeEnabled) {
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
          <h4>{t(`form.proxyConfig`)}</h4>
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
              key={`${item.id}.proxyDestination`}
              control={form.control}
              name={`${item.id}.proxyDestination`}
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
              key={`${item.id}.stripPrefix`}
              control={form.control}
              name={`${item.id}.stripPrefix`}
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
            key={`${item.id}.proxyConfig`}
            control={form.control}
            name={`${item.id}.proxyConfig`}
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
