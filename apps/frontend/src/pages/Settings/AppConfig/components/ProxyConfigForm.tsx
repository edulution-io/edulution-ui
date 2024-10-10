import React from 'react';
import { AppConfigOption } from '@libs/appconfig/types';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';
import YamlEditor from '@/components/shared/YamlEditor';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import Input from '@/components/shared/Input';

type ProxyConfigFormProps = {
  item: AppConfigOption;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  proxyConfigEnabled: boolean;
  setProxyConfigEnabled: (value: boolean) => void;
};

const ProxyConfigForm: React.FC<ProxyConfigFormProps> = ({ item, form, proxyConfigEnabled, setProxyConfigEnabled }) => {
  const { t } = useTranslation();

  //   const defaultYaml = {};

  return (
    <AccordionSH type="multiple">
      <AccordionItem value="onlyOffice">
        <AccordionTrigger className="flex text-xl font-bold">
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
                  <h4>{t(`form.proxyPath`)}</h4>
                  <FormControl>
                    <Input
                      {...field}
                      variant="lightGray"
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
                  <h4>{t(`form.proxyDestination`)}</h4>
                  <FormControl>
                    <Input
                      {...field}
                      variant="lightGray"
                    />
                  </FormControl>
                  <FormMessage className="text-p" />
                </FormItem>
              )}
            />
          </div>
          <FormFieldSH
            key={`${item.id}.proxyConfig`}
            control={form.control}
            name={`${item.id}.proxyConfig`}
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <h4>{t(`form.proxyConfig`)}</h4>
                <FormControl>
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={proxyConfigEnabled}
                        onCheckedChange={setProxyConfigEnabled}
                      />
                      <p>{t('form.expertMode')}</p>
                    </div>
                    {proxyConfigEnabled ? (
                      <YamlEditor
                        value={field.value as string}
                        onChange={field.onChange}
                      />
                    ) : null}
                  </>
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
