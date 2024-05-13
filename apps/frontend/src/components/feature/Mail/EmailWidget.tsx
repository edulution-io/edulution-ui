import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParsedMail } from 'mailparser';
import Mail from '@/assets/icons/edulution/Mail.svg';
import { DropdownMenu } from '@/components';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { CardContent, Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import mockMails from '@/components/feature/Mail/mock-mails';
import Email from '@/components/feature/Mail/Email';
import { ImapSearchParameter } from './imap-search-options';

const EmailWidget = () => {
  const { t } = useTranslation();

  const [selected, setSelected] = React.useState<string>(ImapSearchParameter.ALL);
  const [mails, setMails] = React.useState<ParsedMail[]>([]);

  const getOptions = () => {
    const options: { id: string; name: string }[] = [];
    const ImapParameter = Object.keys(ImapSearchParameter);
    ImapParameter.forEach((key, index) => {
      options.push({ id: index.toString(), name: key });
    });
    return options;
  };

  const getMails = () => {
    // fetch mails
    setMails(mockMails);
  };

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%]"
    >
      <CardContent>
        <h4
          color="white"
          className="font-bold"
        >
          MAILBOX
          <p>{t('mail.sidebar')}</p>
          <img
            src={Mail}
            alt="mail"
            width={BUTTONS_ICON_WIDTH}
          />
        </h4>
        <div className="mb-4 mt-2">
          <DropdownMenu
            options={getOptions()}
            selectedVal={selected}
            handleChange={setSelected}
          />
        </div>
        <div className="mb-4 flex items-end justify-end">
          <Button
            variant="btn-collaboration"
            onClick={() => getMails()}
          >
            {t('update')}
          </Button>
        </div>
        {mails.length > 0 && (
          <div className="h-100 overflow-y-scroll rounded border bg-gray-300 p-2 shadow-lg">
            {mails.map((mail, index) => (
              <Email
                key={`mail_${mail.messageId}`}
                emailIndex={`${index}`}
                {...mail}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailWidget;
