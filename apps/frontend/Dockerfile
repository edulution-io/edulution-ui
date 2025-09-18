### manifest digest for nginx:1.29.0-alpine3.22 arch:amd64
FROM nginx@sha256:845b5424415de5f77dd5753cbb7c1be8bd8e44cc81f20f9705783a02f8848317

WORKDIR /usr/share/nginx/html

COPY dist/apps/frontend .

COPY nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
