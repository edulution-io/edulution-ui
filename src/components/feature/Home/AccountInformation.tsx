import { CardContent, Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";

export const AccountInformation = () => {
  return (
    <Card variant="primary" className="min-h-[100%]">
      <CardContent>
        <div className="text-white">
          <div className="flex flex-col gap-3">
            <p className="font-bold">KONTO-INFORMATIONEN</p>
            <p>Name: Netzint Testlehrer</p>
            <p>E-Mail: frau.mustermann@netzint.de</p>
            <p>Schule: Testschule</p>
            <p>Rolle: Lehrer</p>
          </div>
          <Button variant="btn-primary" className="mt-4">
            Passwort ändern
          </Button>
        </div>

        <div className="mt-8 text-white">
          <p className="font-bold">MEINE INFORMATIONEN</p>
          <p>Mail Alias: teachertest@sgmaulbronn.de</p>
          <Button variant="btn-primary" className="mt-4">
            Meine Daten ändern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
