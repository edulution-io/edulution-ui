### manifest digest for node:20.19.5-alpine3.22 arch:amd64
FROM node@sha256:be8d32d651b3e0c9c2b28fdc1d3888408125d703232013cff955344d052027e5

WORKDIR /opt/edulution/api

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./
COPY ./data/public/assets /opt/edulution/api/assets

EXPOSE 3000

CMD ["/bin/sh", "-c", "cp -rn /opt/edulution/api/assets /opt/edulution/api/data/public/assets && node ./main.js"]
