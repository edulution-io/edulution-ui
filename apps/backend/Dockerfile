FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose the port on which the app will run
EXPOSE 3000
RUN npm run build
# Start the server using the production build
CMD ["node", "dist/main"]
