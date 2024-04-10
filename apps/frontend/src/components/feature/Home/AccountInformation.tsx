import React, { useEffect } from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import useApiStore from '@/store/lmnStore';

const AccountInformation = () => {
  const { data, fetchData } = useApiStore((state) => ({
    fetchData: state.fetchData,
    data: state.data,
  }));
  const username = import.meta.env.VITE_USERNAME as string;

  useEffect(() => {
    fetchData({ url: `/api/v1/users/${username}`, method: 'GET' }).catch(console.error);
  }, [username, fetchData]);

  const userInfoFields = [
    { label: 'Name', value: data ? data.displayName : '...' },
    { label: 'E-Mail', value: data ? data.mail : '...' },
    { label: 'Schule', value: data ? data.school : '...' },
    { label: 'Rolle', value: data ? data.sophomorixRole : '...' },
  ];

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%]"
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">KONTO-INFORMATIONEN</h4>
          {userInfoFields.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col"
            >
              <p className="underline">{label}:</p>
              <p className="max-w-xs truncate">{value || '...'}</p>
            </div>
          ))}

          <Button
            variant="btn-collaboration"
            className="mt-4"
            size="sm"
          >
            Passwort ändern
          </Button>
        </div>

        <div className="mt-6">
          <h4 className="font-bold">MEINE INFORMATIONEN</h4>
          <p>Mail Alias: teachertest@sgmaulbronn.de</p>
          <Button
            variant="btn-collaboration"
            className="mt-4"
            size="sm"
          >
            Meine Daten ändern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInformation;
