### index digest for node:18-alpine node:18.20.4 alpine:3.20 arch:amd64
FROM node@sha256:02376a266c84acbf45bd19440e08e48b1c8b98037417334046029ab585de03e2

RUN mkdir -p /opt/edulution/public/downloads

RUN mkdir -p /opt/edulution/api/traefik

WORKDIR /opt/edulution/api

ENV NODE_ENV production

COPY ./dist/apps/api/ ./

USER root

RUN npm ci

RUN chown -R node:node /opt/edulution/api/

RUN chown -R node:node /opt/edulution/public/

RUN chown -R node:node /opt/edulution/api/traefik

USER node

EXPOSE 3000

CMD ["node", "./main.js"]
