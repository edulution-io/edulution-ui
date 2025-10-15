### manifest digest for node:20.19.1-alpine3.21 arch:amd64
FROM node@sha256:c628bdc7ebc7f95b1b23249a445eb415ce68ae9def8b68364b35ee15e3065b0f

WORKDIR /opt/edulution/api

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./
COPY ./data/public/assets /opt/edulution/api/assets

EXPOSE 3000

CMD ["/bin/sh", "-c", "cp -rn /opt/edulution/api/assets /opt/edulution/api/data/public/assets && node ./main.js"]
