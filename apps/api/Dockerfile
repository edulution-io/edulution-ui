### manifest digest for node:18.20.5-alpine3.20 node:18.20.5 alpine:3.20 arch:amd64
FROM node@sha256:7000d2e73f938c4f62fdda6d398d7dffd50e6c129409ae2b1a36ccebf9289ffe

WORKDIR /opt/edulution/api

ENV NODE_ENV production

COPY ./dist/apps/api/package*.json ./

RUN npm ci

COPY ./dist/apps/api/ ./

RUN echo '#!/bin/sh' > /start.sh && \
    echo 'DOCKER_GID=$(stat -c "%g" /var/run/docker.sock)' >> /start.sh && \
    echo 'addgroup -g $DOCKER_GID docker || true' >> /start.sh && \
    echo 'adduser node docker' >> /start.sh && \
    echo 'exec "$@"' >> /start.sh && \
    chmod +x /start.sh

RUN chown -R node:node /opt/edulution/api/

USER node

EXPOSE 3000

ENTRYPOINT ["/start.sh"]
CMD ["node", "./main.js"]
