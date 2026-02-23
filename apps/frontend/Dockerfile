### manifest digest for nginx:1.29.2-alpine3.22 arch:amd64
FROM nginx@sha256:b03ccb7431a2e3172f5cbae96d82bd792935f33ecb88fbf2940559e475745c4e

ARG APP_VERSION=unknown
ARG COMMIT_SHA=unknown
ARG BUILD_DATE=unknown
ARG BUILD_NUMBER=unknown

LABEL org.opencontainers.image.version=$APP_VERSION
LABEL org.opencontainers.image.revision=$COMMIT_SHA
LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.source="https://github.com/edulution-io/edulution-ui"

ENV APP_VERSION=$APP_VERSION
ENV COMMIT_SHA=$COMMIT_SHA
ENV BUILD_DATE=$BUILD_DATE
ENV BUILD_NUMBER=$BUILD_NUMBER

WORKDIR /usr/share/nginx/html

COPY dist/apps/frontend .
RUN echo "{\"version\":\"$APP_VERSION\",\"commitSha\":\"$COMMIT_SHA\",\"buildDate\":\"$BUILD_DATE\",\"buildNumber\":\"$BUILD_NUMBER\"}" > version.json

COPY nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
