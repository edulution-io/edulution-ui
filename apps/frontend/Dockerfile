### manifest digest for nginx:1.27.3-alpine3.20 arch:amd64
FROM nginx@sha256:b1f7437a6d0398a47a5d74a1e178ea6fff3ea692c9e41d19c2b3f7ce52cdb371

WORKDIR /usr/share/nginx/html

COPY dist/apps/frontend .

COPY nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
