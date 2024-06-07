const AIChatSetup = () => {
  return (
    <div className="mb-4">
      <p className="p-4">
        Künstliche Intelligenz (KI) ist die Simulation menschlicher Intelligenzprozesse durch Maschinen, insbesondere
        Computer Systeme. Zu diesen Prozessen gehören das Lernen (der Erwerb von Informationen und Regeln für die
        Nutzung dieser Informationen), Schlussfolgerungen (Anwendung von Regeln, um zu annähernden oder definitiven
        Schlussfolgerungen zu gelangen) und Selbstkorrektur. Besondere Anwendungen der KI sind Expertensysteme,
        Spracherkennung und maschinelles Sehen. Übersetzt mit DeepL.com (kostenlose Version)
      </p>
      <h3 className="pt-4">Ollama Setup</h3>
      <p className="p-4">
        Kopieren Sie das folgende Skript und führen Sie es in Ihrem Terminal aus, um Ollama unter Linux zu installieren:
      </p>
      <pre>
        <code>{`#!/bin/sh
# This script installs Ollama on Linux.
# It detects the current operating system architecture and installs the appropriate version of Ollama.

set -eu

status() { echo ">>> $*" >&2; }
error() { echo "ERROR $*"; exit 1; }
warning() { echo "WARNING: $*"; }

TEMP_DIR=$(mktemp -d)
cleanup() { rm -rf $TEMP_DIR; }
trap cleanup EXIT

available() { command -v $1 >/dev/null; }
require() {
    local MISSING=''
    for TOOL in $*; do
        if ! available $TOOL; then
            MISSING="$MISSING $TOOL"
        fi
    done

    echo $MISSING
}`}</code>
      </pre>

      <h3 className="pt-4">Installation mit Standardkonfiguration</h3>
      <p className="p-4">Wenn Ollama auf Ihrem Computer installiert ist, verwenden Sie diesen Befehl:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main`}
        </code>
      </pre>

      <p className="p-4">Wenn sich Ollama auf einem anderen Server befindet, verwenden Sie diesen Befehl:</p>
      <p className="p-4">
        Um sich mit Ollama auf einem anderen Server zu verbinden, ändern Sie die OLLAMA_BASE_URL in die URL des Servers:
      </p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 -e OLLAMA_BASE_URL=https://example.com -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main`}
        </code>
      </pre>

      <p className="p-4">Um Open WebUI mit Nvidia GPU-Unterstützung auszuführen, verwenden Sie diesen Befehl:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 --gpus all --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:cuda`}
        </code>
      </pre>

      <h3 className="pt-4">Installation nur für OpenAI API-Nutzung</h3>
      <p className="p-4">Wenn Sie nur die OpenAI API verwenden, benutzen Sie diesen Befehl:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 -e OPENAI_API_KEY=your_secret_key -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main`}
        </code>
      </pre>

      <h3 className="pt-4">Installation von Open WebUI mit gebündelter Ollama-Unterstützung</h3>
      <p className="p-4">
        Bei dieser Installationsmethode wird ein einziges Container-Image verwendet, das Open WebUI mit Ollama bündelt
        und so eine rationelle Einrichtung über einen einzigen Befehl. Wählen Sie den passenden Befehl für Ihre
        Hardware-Einrichtung:
      </p>

      <p className="p-4">
        Mit GPU-Unterstützung: Nutzen Sie die GPU-Ressourcen, indem Sie den folgenden Befehl ausführen:
      </p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 --gpus=all -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama`}
        </code>
      </pre>

      <p className="p-4">
        Nur für CPU: Wenn Sie keinen Grafikprozessor verwenden, benutzen Sie stattdessen diesen Befehl:
      </p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama`}
        </code>
      </pre>

      <p className="p-4">
        Beide Befehle ermöglichen eine integrierte, mühelose Installation von Open WebUI und Ollama, so dass Sie alles
        schnell zum Laufen bringen können.
      </p>

      <p className="p-4">
        Nach der Installation können Sie Open WebUI unter <a href="http://localhost:3000">http://localhost:3000</a>{' '}
        aufrufen. Viel Spaß! 😄
      </p>
    </div>
  );
};

export default AIChatSetup;
