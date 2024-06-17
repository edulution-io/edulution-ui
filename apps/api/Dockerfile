FROM node:18-alpine

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
