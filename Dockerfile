FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist/apps/frontend .
COPY nginx-selfsigned.crt /etc/nginx/ssl/nginx-selfsigned.crt
COPY nginx-selfsigned.key /etc/nginx/ssl/nginx-selfsigned.key
COPY nginx.conf /etc/nginx/nginx.conf
RUN chmod 600 /etc/nginx/ssl/nginx-selfsigned.crt /etc/nginx/ssl/nginx-selfsigned.key
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]