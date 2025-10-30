### manifest digest for nginx:1.29.2-alpine3.22 arch:amd64
FROM nginx@sha256:b03ccb7431a2e3172f5cbae96d82bd792935f33ecb88fbf2940559e475745c4e

WORKDIR /usr/share/nginx/html

COPY dist/apps/frontend .

COPY nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
