### index digest for node:18-alpine node:18.20.3 alpine:3.20 arch:amd64
FROM node@sha256:05412f5b9ed819c373a2535804e473a155fc91bfb7adf469ec2312e056a9e87f

RUN mkdir -p /opt/edulution/public/downloads

WORKDIR /opt/edulution/api

ENV NODE_ENV production

COPY ./dist/apps/api/ ./

USER root

RUN npm ci

RUN chown -R node:node /opt/edulution/api/

RUN chown -R node:node /opt/edulution/public/

USER node

EXPOSE 3000

CMD ["node", "./main.js"]
