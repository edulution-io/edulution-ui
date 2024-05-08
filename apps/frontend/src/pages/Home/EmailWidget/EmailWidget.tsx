import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import MailIcon from '@/assets/icons/edulution/Mail.svg';
import { DropdownMenu } from '@/components';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { Button } from '@/components/shared/Button';
import { CardContent, Card } from '@/components/shared/Card';
import useMailApiQuery from '@/api/useMailApiQuery';
import MailDisplay from '@/components/shared/MailDisplay';
import MailList from '@/components/shared/MailList';
import { Popover } from '@/components/ui/Popover';
import { ImapSearchParameter } from './imap-search-options';
import { Mail } from './mail-type';

const EmailWidget = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { getMails } = useMailApiQuery();

  const [shouldFetch, setShouldFetch] = React.useState<boolean>(true);
  const [selectedFlag, setSelectedFlag] = React.useState<string>(ImapSearchParameter.ALL);
  const [selectedMail, setSelectedMail] = React.useState<Mail | undefined>(undefined);
  const [mails, setMails] = React.useState<Mail[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setShouldFetch(true);
    } else {
      setShouldFetch(false);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (shouldFetch && auth.isAuthenticated) {
      const fetchData = async () => {
        setIsLoading(true);

        try {
          const mailData = await getMails();
          if (mailData) {
            setMails(mailData);
          }
        } catch (e) {
          console.error('Error fetching data:', e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData().catch(() => null);
    }
  }, [shouldFetch]);

  const getOptions = () => {
    const options: { id: string; name: string }[] = [];
    const ImapParameter = Object.keys(ImapSearchParameter);
    ImapParameter.forEach((key, index) => {
      options.push({ id: index.toString(), name: key });
    });
    return options;
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
            src={MailIcon}
            alt="mail"
            width={BUTTONS_ICON_WIDTH}
          />
        </h4>
        <div className="mb-4 mt-2 flex justify-between">
          <DropdownMenu
            options={getOptions()}
            selectedVal={selectedFlag}
            handleChange={setSelectedFlag}
          />
          {/* </div> */}
          {/* <div className="mb-4 flex items-end justify-end"> */}
          <Button
            variant="btn-collaboration"
            onClick={() => setShouldFetch(true)}
          >
            {t('update')}
          </Button>
        </div>
        <div className="mb-4 mt-2 flex justify-between">
          {isLoading === true && (
            <div className="h-100 flex items-center justify-center">
              <p>{t('loading')}</p>
            </div>
          )}
          {isLoading === false && mails.length > 1 && (
            <MailList
              items={mails}
              selected={selectedMail}
              changeSelectionOnClick={(mail: Mail) => setSelectedMail(mail)}
            />
          )}
          {isLoading === false && !!selectedMail && (
            <Popover>
              <MailDisplay mail={selectedMail} />
            </Popover>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailWidget;
