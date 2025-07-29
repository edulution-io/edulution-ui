# edulution UI

[![Node](https://img.shields.io/badge/node-20.x-brightgreen?style=for-the-badge)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.x-blue?style=for-the-badge)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%E2%9D%A4-red?style=for-the-badge)](https://nestjs.com)
[![NX Monorepo](https://img.shields.io/badge/nx-monorepo-blue?style=for-the-badge)](https://nx.dev)
[![License](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=for-the-badge)](https://github.com/edulution-io/edulution-ui/tree/master/LICENSE)
[![Community Forum](https://img.shields.io/discourse/users?style=for-the-badge&logo=discourse&logoColor=white&server=https%3A%2F%2Fask.linuxmuster.net)](https://ask.linuxmuster.net/tag/edulution)

## Overview

Edulution is a comprehensive, all-in-one solution for modern educational institutions. The modular and scalable digital package for multi-school environments covers all aspects of educational operations and can be customized to meet a wide range of requirements.

## Development

### Description

A Full Stack Application build with Vite+React (frontend) and Nest.js for the API. NX is used to organise the monorepo.

   <a href="https://github.com/edulution-io/edulution-ui">
        <img src="https://raw.githubusercontent.com/edulution-io/edulution-docs/main/source/_static/Grafik_edulution_Tech_Stack.png" alt="Tech-Stack" style="background-color: #0d1117 ;"/>
    </a>

### Maintenance Details

| [Community support](https://ask.linuxmuster.net/tag/edulution) | ✅ YES |
| :------------------------------------------------------------: | :----: |
|                       Actively developed                       | ✅ YES |

### Getting Started

#### Prerequisites

- Node.js 20 LTS
- Running MongoDB
- Running Redis

#### Public Key

Read the public key and certificate from oidc provider (Keycloak >> realm settings >> keys). Then add `edulution.pem` file to the project root. Insert the key/cert as follwed:

```
-----BEGIN CERTIFICATE-----
<CERTIFICATE CONTENT>
-----END CERTIFICATE-----
-----BEGIN PUBLIC KEY-----
<PUBLIC KEY CONTENT>
-----END PUBLIC KEY----
```

#### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Place a `.env` file in apps/api and a `.env.development` file in apps/frontend (`.env.default` as template)

3. Setup redis and mongoDB via `docker-compose.yml`

   ```bash
   docker compose pull
   docker compose up -d
   ```

4. Start API

   ```bash
   npm run api
   ```

   The API will be served on http://localhost:3001/

5. Start Frontend

   ```bash
   npm run dev
   ```

   The frontend will be served on http://localhost:5173/

6. Production build

   ```bash
   npm run build:all
   ```

## Documentation

#### Visit https://docs.edulution.io/

## Build

#### Build local

```bash
npm run build:all && \
docker build -t ghcr.io/edulution-io/edulution-ui -f apps/frontend/Dockerfile . && \
docker build -t ghcr.io/edulution-io/edulution-api -f apps/api/Dockerfile . && \
docker compose up -d
```

## Deploy

#### Visit https://get.edulution.io to get the deployment script. Or copy:

```bash
bash <(curl -s https://get.edulution.io/installer)
```

---

### OnlyOffice in development

1. Start the OnlyOffice container from the settings (http://localhost:5173/settings/filesharing), make sure the port `8088` is available.

2. Enter the Only Office Integration values in the settings (http://localhost:5173/settings/filesharing):

- OnlyOffice-URL: `http://host.docker.internal:8088/`
- OnlyOffice JWT Secret: `<your-secret`

3. On some systems `host.docker.internal` is not natively available without additional configuration. How to set up in Linux:

- Find the host machine's IP address
  ```bash
  ip addr show docker0
  ```
- Add the mapping to `/etc/hosts`
  ```bash
  sudo nano /etc/hosts
  ```
- Add the following line (replace the IP with the actual one)
  ```bash
  172.17.0.1 host.docker.internal
  ```
- You are done. Test it with
  ```bash
  wget http://host.docker.internal:5173
  ```
