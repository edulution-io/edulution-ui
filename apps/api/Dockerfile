### manifest digest for node:22.21.1-alpine3.22 arch:amd64
FROM node@sha256:ef30b897b4b924010aab656801cb44fe27589b5d0724ba080b191d75f1f81af0

WORKDIR /opt/edulution/api

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./
COPY ./data/public/assets /opt/edulution/api/assets

EXPOSE 3000

CMD ["/bin/sh", "-c", "cp -rn /opt/edulution/api/assets /opt/edulution/api/data/public/assets && node ./main.js"]
