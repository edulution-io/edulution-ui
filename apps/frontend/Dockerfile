### index digest for nginx:stable-alpine3.19 arch:amd64
FROM nginx@sha256:d1e71ea5319a3916725e44ba4aa230d24c17924389d44cbdab67b7abd41d3b78
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY dist/apps/frontend .
RUN apk update && \
    apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 \
    -subj  "/C=DE/ST=BW/O=Netzint GmbH/CN=edulution.io" \
     -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx-selfsigned.key \
     -out /etc/nginx/ssl/nginx-selfsigned.crt;

COPY nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
