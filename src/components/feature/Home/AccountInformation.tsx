import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

const AccountInformation = () => (
  <Card
    variant="collaboration"
    className="min-h-[100%]"
  >
    <CardContent>
      <>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">KONTO-INFORMATIONEN</h4>
          <p>Name: Netzint Testlehrer</p>
          <p>E-Mail: frau.mustermann@netzint.de</p>
          <p>Schule: Testschule</p>
          <p>Rolle: Lehrer</p>
        </div>
        <Button
          variant="btn-collaboration"
          className="mt-4"
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
        >
          Meine Daten ändern
        </Button>
      </>
    </CardContent>
  </Card>
);

export default AccountInformation;
