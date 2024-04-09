import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import useLmnFetch from '@/hooks/api/useLmnFetch';
import UserLmnInfo from '@/hooks/api/dataTypes/UserInfo';

const AccountInformation = () => {
  const { data, loading } = useLmnFetch({
    url: `/api/v1/users/${import.meta.env.VITE_USERNAME}`,
    method: 'GET',
  });
  const userInfo = data as UserLmnInfo;
  return (
    <Card
      variant="collaboration"
      className="min-h-[100%]"
    >
      <CardContent>
        <>
          <div className="flex flex-col gap-3">
            <p>{loading ? <p>Loafing</p> : <p>{userInfo.displayName}</p>}</p>
            <h4 className="font-bold">KONTO-INFORMATIONEN</h4>
            <p>Name: Netzint Testlehrer</p>
            <p>E-Mail: frau.mustermann@netzint.de</p>
            <p>Schule: Testschule</p>
            <p>Rolle: Lehrer</p>
          </div>
          <Button
            variant="btn-collaboration"
            className="mt-4"
            size="sm"
          >
            Passwort ändern
          </Button>
        </>

        <>
          <h4 className="font-bold">MEINE INFORMATIONEN</h4>
          <p>Mail Alias: teachertest@sgmaulbronn.de</p>
          <Button
            variant="btn-collaboration"
            className="mt-4"
            size="sm"
          >
            Meine Daten ändern
          </Button>
        </>
      </CardContent>
    </Card>
  );
};

export default AccountInformation;
