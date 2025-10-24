### manifest digest for node:20.19.4-alpine3.22 arch:amd64
FROM node@sha256:ae6ee91a652d927de01d550c29f863a52f1da390c89df95f3ceba256d1e62604

WORKDIR /opt/edulution/api

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./
COPY ./data/public/assets /opt/edulution/api/assets

EXPOSE 3000

CMD ["/bin/sh", "-c", "cp -rn /opt/edulution/api/assets /opt/edulution/api/data/public/assets && node ./main.js"]
