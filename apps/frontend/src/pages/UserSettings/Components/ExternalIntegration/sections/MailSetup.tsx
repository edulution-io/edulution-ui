const MailSetup = () => {
  return (
    <div className="mb-4">
      <p>Konfigurieren Sie hier Ihre E-Mail-Einstellungen.</p>
      <h2 className="mb-4 mt-4 text-2xl font-semibold">Netzint Maildocker Mailserver für Linuxmuster</h2>

      <p className="p-4">Anhand der Demo Umgebung:</p>
      <p className="p-4">
        DNS Records setzen: (in der Annahme dass Webmail-Zugriff, IMAP, Active-Sync etc. auf der selben IP auflaufen wie
        SMTP (in/out).
      </p>
      <pre>
        <code>
          {`# Name                            Type       Value
@                                 MX 10      mailtransport.demo.mutli.schule
mail.demo.mutli.schule            A          185.50.122.123
mailtransport.demo.mutli.schule   A          185.50.122.123
autodiscover.demo.mutli.schule    CNAME      mail.demo.mutli.schule
admin-mail.demo.mutli.schule      CNAME      mail.demo.mutli.schule
webmail.demo.mutli.schule         CNAME      mail.demo.mutli.schule
autoconfig.demo.mutli.schule      CNAME      mail.demo.mutli.schule
demo.multi.schule                 TXT        v=spf1 mx a -all
_dmarc.demo.multi.schule          TXT        v=DMARC1; p=reject; fo=1;
==> später in Anleitung: s1024._domainkey.demo.multi.schule <GENERIERTER-EINTRAG-AUS-Mailcow>`}
        </code>
      </pre>

      <p className="p-4">Reverse DNS Records setzen:</p>
      <pre>
        <code>
          {`# Name                            Type       Value
123.122.50.185.in-addr.arpa       PTR        185.50.122.123`}
        </code>
      </pre>

      <pre>
        <code>
          {`mkdir -p /srv/docker/
cd /srv/docker
git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized/`}
        </code>
      </pre>

      <p className="p-4">Konfig generieren:</p>
      <pre>
        <code>{`./generate_config.sh`}</code>
      </pre>

      <p className="p-4">
        Bitte an der Firewall für die IP der Mailcow-VM eine Freigabe für folgende Dienste einrichten (sofern die DMZ
        nur eingeschränkt ins Internet darf):
      </p>
      <ul className="list-inside list-disc p-4">
        <li>ICMP ausgehend</li>
        <li>DNS auf 1.1.1.1, 8.8.8.8 und 9.9.9.9 (oder eben DNS freischalten generell für diese VM)</li>
        <li>NTP 123 ausgehend</li>
      </ul>
      <p className="p-4">Der Container wird beim Start div. Anfragen stellen, damit er intern sauber läuft.</p>

      <p className="p-4">Container starten:</p>
      <pre>
        <code>{`docker compose up -d`}</code>
      </pre>

      <p className="p-4">
        <a
          href="https://$ipadresse"
          className="text-blue-500 underline"
        >
          https://$ipadresse
        </a>
      </p>
      <h4 className="p-4">Passwort ändern.</h4>

      <p className="p-4">
        API Key mit Read/write permissions in der Mailcow UI anlegen. Freigabe für die Docker Netzwerkebereiche:
      </p>
      <pre>
        <code>
          {`inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
inet 172.22.1.1/24 brd 172.22.1.255 scope global br-mailcow`}
        </code>
      </pre>

      <p className="p-4">
        Binduser für Mailserver anlegen auf Schulserver. Wichtig! Dessen Passwort sollte nur alphanumerische Zeichen
        beinhalten, am besten manuell nochmal setzen!
      </p>
      <p className="p-4">docker-compose.override.yml anlegen und befüllen</p>
      <pre>
        <code>
          {`version: '2.1'
services:
    linuxmuster-mailcow:
        image: netzint/linuxmuster-mailcow
        container_name: mailcowcustomized_linuxmuster-mailcow
        restart: always
        volumes:
            - ./data/conf/dovecot:/conf/dovecot:rw
            - ./data/conf/sogo:/conf/sogo:rw
        depends_on:
            - nginx-mailcow
            - dockerapi-mailcow
            - php-fpm-mailcow
            - sogo-mailcow
            - dovecot-mailcow
        environment:
            - LINUXMUSTER_MAILCOW_LDAP_URI=ldaps://server.gam.multi.schule
            - LINUXMUSTER_MAILCOW_LDAP_BASE_DN=OU=SCHOOLS,DC=gammertingen,DC=multi,DC=schule
            - LINUXMUSTER_MAILCOW_LDAP_BIND_DN=cn=mail-binduser,OU=Management,OU=GLOBAL,DC=gammertingen,DC=multi,DC=schule
            - LINUXMUSTER_MAILCOW_LDAP_BIND_DN_PASSWORD=23453425
            - LINUXMUSTER_MAILCOW_API_KEY=46C9E7-49BD16---
            - LINUXMUSTER_MAILCOW_SYNC_INTERVAL=300
            - LINUXMUSTER_MAILCOW_DOMAIN_QUOTA=250000
            - LINUXMUSTER_MAILCOW_ENABLE_GAL=1
        networks:
            mailcow-network:
                aliases:
                    - linuxmuster
    sogo-mailcow:
        volumes:
            - ./data/conf/sogo/ldap.conf:/etc/ldap/ldap.conf:rw
    dovecot-mailcow:
        volumes:
            - ./data/conf/sogo/ldap.conf:/etc/ldap/ldap.conf:rw`}
        </code>
      </pre>

      <p className="p-4">
        Falls der Mailserver den LDAPS Server direkt erreichen kann (zB. reverse Proxy von diesem im gleichen Netz), so
        kann mittels Erweiterung der dovecot-mailcow und sogo-mailcow container die Kommunikation entsprechend
        vereinfach werden. Beispiel:
      </p>
      <pre>
        <code>
          {`version: '2.1'
services:
    linuxmuster-mailcow:
        image: netzint/linuxmuster-mailcow
        container_name: mailcowcustomized_linuxmuster-mailcow
        restart: always
        volumes:
            - ./data/conf/dovecot:/conf/dovecot:rw
            - ./data/conf/sogo:/conf/sogo:rw
        depends_on:
            - nginx-mailcow
            - dockerapi-mailcow
            - php-fpm-mailcow
            - sogo-mailcow
            - dovecot-mailcow
        environment:
            - LINUXMUSTER_MAILCOW_LDAP_URI=ldap://10.0.0.1
            - LINUXMUSTER_MAILCOW_LDAP_BASE_DN=OU=SCHOOLS,DC=linuxmuster,DC=lan
            - LINUXMUSTER_MAILCOW_LDAP_BIND_DN=cn=mail-binduser,OU=Management,OU=GLOBAL,DC=linuxmuster,DC=lan
            - LINUXMUSTER_MAILCOW_LDAP_BIND_DN_PASSWORD=vhLxVwy9YTcMg
            - LINUXMUSTER_MAILCOW_API_KEY=E1CA71-3D8CE9-7D5928-72027C-164511
            - LINUXMUSTER_MAILCOW_SYNC_INTERVAL=300
            - LINUXMUSTER_MAILCOW_DOMAIN_QUOTA=250000
            - LINUXMUSTER_MAILCOW_ENABLE_GAL=1
        networks:
            mailcow-network:
                aliases:
                    - linuxmuster
        extra_hosts:
          server.sgmaulbronn.de: 10.0.0.3

    dovecot-mailcow:
        volumes:
            - ./data/conf/sogo/ldap.conf:/etc/ldap/ldap.conf:rw
        extra_hosts:
          server.sgmaulbronn.de: 10.0.0.3

    sogo-mailcow:
        volumes:
            - ./data/conf/sogo/ldap.conf:/etc/ldap/ldap.conf:rw
        extra_hosts:
          server.sgmaulbronn.de: 10.0.0.3`}
        </code>
      </pre>

      <p className="p-4">
        <strong>WICHTIG:</strong> Als Base DN eine OU angeben, nicht direkt die TLD. Mit dieser fühlt es zu Fehlern und
        die Dovecot Konfiguration funktioniert <strong>nicht</strong>.
      </p>
      <p className="p-4">
        Ein Trusted Zertifikat ist nicht zwingend nötig solang LDAP verwendet wird. LDAPs funktioniert ausschließlich
        mit passendem Zertifikat.
      </p>
      <p className="p-4">
        Dem Sogo Mailcow fehlt ein Eintrag für die LDAP Zertifikate. Wir kopieren das einfach vom Host System:
      </p>
      <pre>
        <code>{`cp /etc/ldap/ldap.conf ./data/conf/sogo/`}</code>
      </pre>
      <p className="p-4">Linuxmuster Mailcow container manuell anstarten und prüfen ob alles klappt:</p>
      <pre>
        <code>{`docker compose up`}</code>
      </pre>
      <p className="p-4">DKIM schlüssel für Domains anlegen in Mailcow UI (Konfiguration ARC/DKIM Keys)</p>

      <h2 className="mb-4 mt-4 text-2xl font-semibold">Adapt SOGo Styling</h2>

      <h4 className="pt-4">CSS</h4>
      <p className="p-4">
        (originally downloaded from:
        <a
          href="https://github.com/NlightN22/sogo-dark-red/tree/main"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          https://github.com/NlightN22/sogo-dark-red/tree/main
        </a>
        )
      </p>
      <p className="p-4">1. Adapt the 'custom-theme.css' file in the SOGo folder</p>

      <h4 className="pt-4">Logo</h4>
      <p className="p-4">Logo is displayed on the login page</p>
      <p className="p-4">1. Replace the 'sogo-full.svg' file in the SOGo folder</p>

      <h4 className="pt-4">Favicon</h4>
      <p className="p-4">Icon for the tab in tab header</p>
      <p className="p-4">
        1. Replace the 'custom-favicon.ico' file in the SOGo folder (has to have format 32x32 64x64 128x128 256x256)
      </p>

      <h4 className="pt-4">Pagetitle</h4>
      <p className="p-4">Name, Label for the tab in tab header</p>
      <p className="p-4">1. Change the 'SOGoPageTitle' entry in the 'sogo.conf' file in the SOGo folder</p>

      <h4 className="pt-4">Installing Open WebUI with Bundled Ollama Support</h4>
      <p className="p-4">
        This installation method uses a single container image that bundles Open WebUI with Ollama, allowing for a
        streamlined setup via a single command. Choose the appropriate command based on your hardware setup:
      </p>

      <p className="p-4">With GPU Support: Utilize GPU resources by running the following command:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 --gpus=all -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama`}
        </code>
      </pre>

      <p className="p-4">For CPU Only: If you're not using a GPU, use this command instead:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama`}
        </code>
      </pre>

      <p className="p-4">
        Both commands facilitate a built-in, hassle-free installation of both Open WebUI and Ollama, ensuring that you
        can get everything up and running swiftly.
      </p>

      <p className="p-4">
        After installation, you can access Open WebUI at{' '}
        <a
          href="http://localhost:3000"
          className="text-blue-500 underline"
        >
          http://localhost:3000
        </a>
        . Enjoy! 😄
      </p>
    </div>
  );
};

export default MailSetup;
