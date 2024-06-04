const AIChatSetup = () => {
  return (
    <div className="mb-4">
      <p className="p-4">
        Artificial intelligence (AI) is the simulation of human intelligence processes by machines, especially computer
        systems. These processes include learning (the acquisition of information and rules for using the information),
        reasoning (using rules to reach approximate or definite conclusions) and self-correction. Particular
        applications of AI include expert systems, speech recognition and machine vision.
      </p>
      <h3 className="pt-4">Ollama Setup</h3>
      <p className="p-4">Copy the following script and run it in your terminal to install Ollama on Linux:</p>
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

      <h3 className="pt-4">Installation with Default Configuration</h3>
      <p className="p-4">If Ollama is on your computer, use this command:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main`}
        </code>
      </pre>

      <p className="p-4">If Ollama is on a Different Server, use this command:</p>
      <p className="p-4">To connect to Ollama on another server, change the OLLAMA_BASE_URL to the server's URL:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 -e OLLAMA_BASE_URL=https://example.com -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main`}
        </code>
      </pre>

      <p className="p-4">To run Open WebUI with Nvidia GPU support, use this command:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 --gpus all --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:cuda`}
        </code>
      </pre>

      <h3 className="pt-4">Installation for OpenAI API Usage Only</h3>
      <p className="p-4">If you're only using OpenAI API, use this command:</p>
      <pre>
        <code>
          {`docker run -d -p 3000:8080 -e OPENAI_API_KEY=your_secret_key -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main`}
        </code>
      </pre>

      <h3 className="pt-4">Installing Open WebUI with Bundled Ollama Support</h3>
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
        After installation, you can access Open WebUI at <a href="http://localhost:3000">http://localhost:3000</a>.
        Enjoy! 😄
      </p>
    </div>
  );
};

export default AIChatSetup;
