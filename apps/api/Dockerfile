### manifest digest for node:18.20.5-alpine3.20 node:18.20.5 alpine:3.20 arch:amd64
FROM node@sha256:7000d2e73f938c4f62fdda6d398d7dffd50e6c129409ae2b1a36ccebf9289ffe

RUN mkdir -p /opt/edulution/public/downloads

RUN mkdir -p /opt/edulution/apps/bulletinboard/attachments

RUN mkdir -p /opt/edulution/api/traefik

WORKDIR /opt/edulution/api

ENV NODE_ENV production

COPY ./dist/apps/api/ ./

USER root

RUN npm ci

RUN chown -R node:node /opt/edulution/api/

RUN chown -R node:node /opt/edulution/public/

RUN chown -R node:node /opt/edulution/apps/bulletinboard/attachments

RUN chown -R node:node /opt/edulution/api/traefik

USER node

EXPOSE 3000

CMD ["node", "./main.js"]
