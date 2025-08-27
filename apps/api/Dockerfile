### manifest digest for node:20.19.1-alpine3.21 arch:amd64
FROM node@sha256:c628bdc7ebc7f95b1b23249a445eb415ce68ae9def8b68364b35ee15e3065b0f

WORKDIR /opt/edulution/api

COPY ./libs/src/survey/assets/default-files/ ./data/apps/surveys/default-files/
COPY ./libs/src/survey/assets/templates/ ./data/apps/surveys/templates/

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./

EXPOSE 3000

CMD ["node", "./main.js"]
