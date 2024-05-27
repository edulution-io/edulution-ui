FROM node:18-alpine

WORKDIR /opt/edulution/api

ENV NODE_ENV production

COPY ./dist/apps/api/ ./

USER root

RUN npm ci

RUN chown -R node:node /opt/edulution/api/

USER node

EXPOSE 3000

CMD ["node", "./main.js"]
