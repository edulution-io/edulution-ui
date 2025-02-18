### manifest digest for node:18.20.5-alpine3.20 node:18.20.5 alpine:3.20 arch:amd64
FROM node@sha256:7000d2e73f938c4f62fdda6d398d7dffd50e6c129409ae2b1a36ccebf9289ffe

WORKDIR /opt/edulution/api

ENV NODE_ENV=production

COPY ./dist/apps/api/package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./

EXPOSE 3000

CMD ["node", "./main.js"]
