### manifest digest for node:22.21.1-alpine3.22 arch:amd64
FROM node@sha256:ef30b897b4b924010aab656801cb44fe27589b5d0724ba080b191d75f1f81af0

ARG APP_VERSION=unknown
ARG COMMIT_SHA=unknown
ARG BUILD_DATE=unknown
ARG BUILD_NUMBER=unknown

LABEL org.opencontainers.image.version=$APP_VERSION
LABEL org.opencontainers.image.revision=$COMMIT_SHA
LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.source="https://github.com/edulution-io/edulution-ui"

WORKDIR /opt/edulution/api

ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
ENV COMMIT_SHA=$COMMIT_SHA
ENV BUILD_DATE=$BUILD_DATE
ENV BUILD_NUMBER=$BUILD_NUMBER

COPY package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./
COPY ./data/public/assets /opt/edulution/api/assets

EXPOSE 3000

CMD ["/bin/sh", "-c", "mkdir -p /opt/edulution/api/data/public/assets && cp -r /opt/edulution/api/assets/* /opt/edulution/api/data/public/assets/ && node ./main.js"]
