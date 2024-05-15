FROM node:18-alpine

USER node
WORKDIR /opt/edulution/api

ENV NODE_ENV production
COPY --chown=node:node ./dist/apps/api/* .
RUN npm i

EXPOSE 3000

CMD [ "node", "./main.js" ]