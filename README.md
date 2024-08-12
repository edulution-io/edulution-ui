# edulution.io

## Description

A Full Stack Application build with Vite+React (frontend) and Nest.js for the API. NX is used to organise the monorepo.

## Getting Started

### Prerequisites

- Node.js 18 LTS
- Running MongoDB
- Running Redis `docker run -p 6379:6379 -it redis/redis-stack-server:latest`

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set environment variables
   Place a .env file in apps/api and apps/frontend (.env.default as template)

3. Start API

   ```bash
   npm run dev
   ```

   The API will be served on http://localhost:3001/

4. Start Frontend

   ```bash
   npm run api
   ```

   The FE will be served on http://localhost:5173/

5. Production build

   ```bash
   npm run build:all
   ```

# Docker

## Build

### Public Key

Read the public key and certificate from oidc provider (Keycloak >> realm settings >> keys). Then add a public.pem file to the project root. Insert the key/cert as follwed:

```
-----BEGIN CERTIFICATE-----
<CERTIFICATE CONTENT>
-----END CERTIFICATE-----
-----BEGIN PUBLIC KEY-----
<PUBLIC KEY CONTENT>
-----END PUBLIC KEY----
```

### Build apps, containers and start

#### Local

```bash
npm run build:all && \
docker build -t ghcr.io/edulution-io/edulution-ui -f apps/frontend/Dockerfile . && \
docker build -t ghcr.io/edulution-io/edulution-api -f apps/api/Dockerfile . && \
docker compose up -d
```

#### Deploy

```bash
echo "<GH_PERSONAL_ACCESS_TOKEN" | docker login ghcr.io -u <USERNAME> --password-stdin
npm run build:docker:ui
npm run build:docker:api
npm run push:docker:ui
npm run push:docker:api
```
