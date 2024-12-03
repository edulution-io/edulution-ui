### manifest digest for nginx:1.27.3-alpine3.20 arch:amd64
FROM nginx@sha256:b1f7437a6d0398a47a5d74a1e178ea6fff3ea692c9e41d19c2b3f7ce52cdb371
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
