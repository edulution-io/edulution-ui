import React from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircleOutline, MdAddCircleOutline } from 'react-icons/md';
import InputWithChildButton from '@/components/shared/InputWithChildButtons';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { FormFieldSH, FormItem } from '@/components/ui/Form';

interface UserSettingsDetailsFormProps {
  formControl: Control;
  value: string[];
  onChange: (mailProxies: string[]) => void;
}

const MailProxiesField = (props: UserSettingsDetailsFormProps) => {
  const { value: mailProxies, onChange: updateMailProxies, formControl } = props;
  const [newMailProxy, setNewMailProxy] = React.useState<string>('');

  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={formControl}
      name="proxyAddresses"
      render={() => (
        <FormItem>
          <p className="font-bold">{t('usersettings.details.proxyAddresses')}:</p>
          <div className="flex flex-row flex-wrap gap-2">
            {mailProxies.map((proxyAddress) => (
              <BadgeSH
                key={`badge-${proxyAddress}`}
                className="color-white h-[38px] text-white"
              >
                {proxyAddress}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => {
                    if (!proxyAddress) return;
                    const newMailProxies = mailProxies.filter((mp) => mp !== proxyAddress);
                    updateMailProxies(newMailProxies);
                  }}
                >
                  <MdRemoveCircleOutline className="h-[24px] w-[24px]" />
                </button>
              </BadgeSH>
            ))}
            <InputWithChildButton
              className="min-w-[250px]"
              placeholder={t('usersettings.details.newProxy')}
              value={newMailProxy}
              onChange={(e) => setNewMailProxy(e.target.value)}
              inputButtons={[
                {
                  buttonIcon: MdAddCircleOutline,
                  buttonOnClick: () => {
                    if (!newMailProxy) return;
                    const newMailProxies = structuredClone(mailProxies);
                    newMailProxies.push(newMailProxy);
                    updateMailProxies(newMailProxies);
                    setNewMailProxy('');
                  },
                },
              ]}
            />
          </div>
        </FormItem>
      )}
    />
  );
};

export default MailProxiesField;
