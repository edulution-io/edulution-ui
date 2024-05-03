FROM node:18-alpine


USER node

WORKDIR /opt/edulution/api

# ENV NODE_ENV production
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
RUN npm run build:api

EXPOSE 3000

CMD [ "node", "./dist/apps/api/main.js" ]