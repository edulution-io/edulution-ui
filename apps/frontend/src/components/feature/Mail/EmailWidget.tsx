import React, {useCallback, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Mail from '@/assets/icons/edulution/Mail.svg';
import { DropdownMenu } from '@/components';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { CardContent, Card } from '@/components/shared/Card';
import ImapGetMailsClient from '@/components/feature/Mail/imapGetMailsClient';
import { ImapSearchParameter } from './imap-search-options';
// import { getEmails } from '../../../../../../scripts/imap';

const EmailWidget = () => {
  const { t } = useTranslation();

  const [selected, setSelected] = React.useState<string>(ImapSearchParameter.ALL);
  // TODO: add the type for the mails
  // eslint-disable-next-line
  const [mails, setMails] = React.useState<JSON>();

  const ImapClient = new ImapGetMailsClient();

  const getMails = useCallback(async () => {
    const emails = await ImapClient.getMails();
    setMails(emails);
  }, []);

  const getOptions = () => {
    const options: { id: string; name: string }[] = [];
    const ImapParameter = Object.keys(ImapSearchParameter);
    ImapParameter.forEach((key, index) => {
      options.push({ id: index.toString(), name: key });
    });
    return options;
  };

  useEffect(async () => {
    try {
      await getMails();
    } catch (error) {
      console.error('Error fetching emails', error);
    }
  }, []);

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
        <div className="mt-4 flex flex-col justify-between gap-6">
          <DropdownMenu
            options={getOptions()}
            selectedVal={selected}
            handleChange={setSelected}
          />
        </div>
        <div className="mt-4 flex flex-col justify-between gap-6">
          { `${ JSON.stringify(mails, null, 2) }` }
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailWidget;
